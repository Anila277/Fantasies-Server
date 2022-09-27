require('dotenv').config();
const { PORT = 4000, DATABASE_URL } = process.env;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const logger = require('morgan');
const cors = require('cors');
const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth')

const serviceAccount = require('./service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


mongoose.connect(DATABASE_URL);
mongoose.connection
    .on('open', () => console.log('You are connected to mongoose'))
    .on('close', () => console.log('You are disconnected from mongoose'))
    .on('error', (error) => console.log(error.message));

const poemsSchema = new mongoose.Schema({
    name: String,
    image: String,
    content: String,
    author: String,
    user: String,
    tags: Array,
    comments: Array,
    likes: Number,
    dislikes: Number,
}, {timestamps: true})

const Poems = mongoose.model('Poems', poemsSchema);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(logger('dev'));
app.use(cors());

// Custom Authentication Middleware
app.use(async function (req, res, next) {
    //Capture the token from the request
    const token = req.get('Authorization');

    try {
        if (token) {
            const user = await getAuth().verifyIdToken(token.replace('Bearer ', ''));
            req.user = user;
        } else {
            req.user = null;
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: 'Bad Request' })

    }
    next();
});

// Custom Authorization Middleware
function isAuthenticated(req, res, next) {
    if (!req.user) {
        res.status(401).json({ error: 'Must Log In' })
    } else {
        next();
    };
}
//IDUCE

app.get('/api/poems', isAuthenticated, async (req, res) => {
    try {
        res.status(200).json(await Poems.find({ createdByUserId: req.user.uid }));
    } catch (error) {
        console.log(error);
        res.status(400).json({ 'error': 'bad request' });
    }
});

app.post('/api/poems', isAuthenticated, async (req, res) => {
    try {
        req.body.createdByUserId = req.user.uid
        res.status(201).json(await Poems.create(req.body));
    } catch (error) {
        console.log(error);
        res.status(400).json({ 'error': 'bad request' });
    }
});

app.put('/api/poems/:id', async (req, res) => {
    try {
        res.status(200).json(await Poems.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ));
    } catch (error) {
        console.log(error);
        res.status(400).json({ 'error': 'bad request' });
    }
});

app.delete('/api/poems/:id', async (req, res) => {
    try {
        res.status(200).json(await Poems.findByIdAndDelete(
            req.params.id
        ));
    } catch (error) {
        console.log(error);
        res.status(400).json({ 'error': 'bad request' });
    }
});

app.listen(PORT, () => console.log(`Express is listening on PORT: ${PORT}`));