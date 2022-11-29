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

async function run() {

    const userCollection = client.db('Reseller').collection('users');
    const productCollection = client.db('Reseller').collection('products');


    try {

        app.delete('/users', async (req, res) => {
            const id = req.query.id;
            const query = { _id: ObjectId(id) }
            const result = await userCollection.deleteOne(query)

            res.send(result)
        })

        app.post('/users', async (req, res) => {
            const users = req.body;
            const email = users.email;
            console.log(users)
            const query = { email: email }
            const search = await userCollection.find(query).toArray();
            console.log(search)
            if (search.length) {
                return
            }
            const result = await userCollection.insertOne(users);
            //console.log(search)
            res.send(result)
        })

        app.get('/sellers', async (req, res) => {
            const query = { account_type: "seller" }
            const sellers = await userCollection.find(query).toArray()
            res.send(sellers)
        })


        app.get('/users', async (req, res) => {
            const query = {};
            const users = await userCollection.find(query).toArray();
            res.send(users)
        })

        // -----------------------------Seller  verification starts-----------------------------------------


        app.put('/sellerverify', async (req, res) => {
            const id = req.query.id;
            console.log(id);
            const search = { _id: ObjectId(id) }
            const querry = req.body;
            const option = { upsert: true };
            const updateUser = {
                $set: {
                    verifyStatus: true
                }
            }
            const result = await userCollection.updateOne(search, updateUser, option);
            console.log(result)
            res.send(result)
        })

        app.get('/sellerverify/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            console.log(email)
            const user = await userCollection.findOne(query);
            console.log(user)
            res.send({ isverified: user?.verifyStatus === true });
            
        })

        app.get('/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            console.log(email)
            const user = await userCollection.findOne(query);
            console.log(user)
            res.send({ isSeller: user?.account_type === 'seller' });
            
        })

        // ------------------------------   Verified    ------------------------------------------

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await userCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        })

        app.put('/admin', async (req, res) => {
            const id = req.query.id;
            // console.log(id);
            const search = { _id: ObjectId(id) }
            const querry = req.body;
            const option = { upsert: true };
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

        // ---------------------------------------------Product add----------------------------------

        app.post('/products', async (req, res) => {
            const details = req.body;
            // console.log(details);
            const result = await productCollection.insertOne(details)
            res.send(result)
        })
        app.get('/products', async (req, res) => {
            const query = {};
            const result = await productCollection.find(query).toArray();

            res.send(result)
        })
        app.get('/catagory/:name', async (req, res) => {
            const name = req.params.name;
            const jquery = { catagory_name: name };
            const result = await productCollection.find(jquery).toArray();
            res.send(result)
        })

    }
    finally {

    }
}
run().catch(console.dir);
