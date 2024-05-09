const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
  origin: ['http://localhost:5173','http://localhost:5174'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser())

// mongo DB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ylmjbhk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
// make own middle war 

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)

    // collection
    const database = client.db("carServiesDB");
    const serviceCollection = database.collection("servires");
    const bookedCollection = database.collection("bookings");

    app.get("/services", async (req, res) => {
      const cursor = serviceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // get data by id

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id,'dynamic id')
      const query = { _id: new ObjectId(id) }

      const options = {
        projection: {title: 1, img: 1,price : 1 },
      };

      const result  = await serviceCollection.findOne(query,options);
      res.send(result);
    });
    
  // token genarate app post 
  app.post('/jwt',(req, res) => {
    const user = req.body ;
    console.log(user);
    // after checking user request u can use token
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{ expiresIn: '1h' });

    res
    .cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict'
    } )
    .send({success: true})
  })
    // get booking data 
    app.get('/bookings', async (req, res) => {
      // find with email
      console.log(req.query.email);
      console.log(req.cookies?.token, 'tok tok token')
      let query = {} ;
      if(req.query.email){
        query = { email : req.query.email}
      }

      const cursor = bookedCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })

    // post customer data 
    app.post('/bookings', async (req, res) => {
      const booking = req.body ;
      console.log(booking)
      const result = await bookedCollection.insertOne(booking);
      res.send(result)
    })
    // update one data 
    app.patch('/bookings/:id', async (req,res)=>{
      const id = req.params.id ;
      const query = {_id : new ObjectId(id)}
      const updatedBook = req.body ;
      const updateDoc = {
        $set : {
          status : updatedBook.status 
        },
      } ;
      const result = await bookedCollection.updateOne(query,updateDoc);
      res.send(result)
    })

    // delete product
    app.delete('/bookings/:id', async (req,res)=> {
      const id = req.params.id ;
      const query = {_id : new ObjectId(id)};
      const result = await bookedCollection.deleteOne(query);
      res.send(result)
    })



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("car server is running on");
});
app.listen(port, () => {
  console.log(`My Car Port is ${port}`);
});
