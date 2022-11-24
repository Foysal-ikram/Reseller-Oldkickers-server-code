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


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.send(401).send({ message: 'unauthorized ' })

    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.Token, function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: 'unauthorized access' });
        }
        req.decoded = decoded;
        next();
    })

 

}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.tngy8ld.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){

    const userCollection =  client.db('Reseller').collection('users');

    try{
      
        app.post('/users' , async (req,res)=>{
            const users = req.body ;
            const email = users.email ;
            console.log(users)
            const query = {email :email}
            const search = await userCollection.find(query).toArray() ;
            console.log(search)
            if(search.length){
                return 
            }
            const result =await userCollection.insertOne(users) ;
           //console.log(search)
            res.send(result)
        })
        app.get('/users', async (req,res)=>{
            const query = {} ;
            const users = await userCollection.find(query).toArray();
            console.log(users)
            res.send(users)
        } )
    }
    finally{

    }
}
run().catch(console.dir);
