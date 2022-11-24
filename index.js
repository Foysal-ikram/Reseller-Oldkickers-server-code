const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000;

require('dotenv').config();


app.use(cors());
app.use(express.json())

app.get('/', (req, res) => {
    res.send('reseller api runningg');

})

app.listen(port, () => console.log(port))

