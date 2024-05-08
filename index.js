const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());

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

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // collection
    const database = client.db("carServiesDB");
    const serviceCollection = database.collection("servires");
    const bookedCollection = database.collection("bookings");

    app.get("/services", async (req, res) => {
      const cursor = serviceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // why it doesnot works

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

    // get booking data 
    app.get('/bookings', async (req, res) => {
      // find with email
      console.log(req.query.email)
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
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("car server is running on");
});
app.listen(port, () => {
  console.log(`My Car Port is ${port}`);
});
