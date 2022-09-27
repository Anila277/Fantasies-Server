require('dotenv').config();
const { PORT = 4000, DATABASE_URL } = process.env;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const logger = require('morgan');
const cors = require('cors');

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
//IDUCE

app.get('/api/poems', async (req, res) => {
    try {
        res.status(200).json(await Poems.find({}));
    } catch (error) {
        console.log(error);
        res.status(400).json({'error': 'bad request'});      
    }
});    

app.post('/api/poems', async (req, res) => {
    try {
        res.status(201).json(await Poems.create(req.body));
    } catch (error) {
        console.log(error);
        res.status(400).json({'error': 'bad request'});
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
        res.status(400).json({'error': 'bad request'});
    }
});

app.delete('/api/poems/:id', async (req, res) => {
    try {
        res.status(200).json(await Poems.findByIdAndDelete(
            req.params.id
        ));
    } catch (error) {
        console.log(error);
        res.status(400).json({'error': 'bad request'});
    }
});

app.listen(PORT, () => console.log(`Express is listening on PORT: ${PORT}`));