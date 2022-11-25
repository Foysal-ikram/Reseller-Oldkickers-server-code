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

        app.put('/admin' , async (req,res)=>{
            const id = req.query.id ;
            console.log(id);
            const search = { _id : ObjectId(id)}
            const querry = req.body ;
            const option = {upsert : true } ;
            const updateUser = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await userCollection.updateOne(search, updateUser, option);
            res.send(result)

        })
        app.put('/removeadmin', async (req, res) => {
            const id = req.query.id;
            const search = { _id: ObjectId(id) }
            const admin = req.body;
            const option = { upsert: true };
            const updateUser = {
                $set: {
                    role: 'buyer'
                }
            }
            const result = await userCollection.updateOne(search, updateUser, option);
            res.send(result)
        })




    }
    finally{

    }
}
run().catch(console.dir);
