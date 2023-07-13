const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 3000

// middle ware
app.use(cors())
app.use(express.json());





const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cnbwwnw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();


    const userCollection = client.db('doctorCamp').collection('users')
    // users collection get
    app.get('/users',async(req,res)=>{
      const result = await userCollection.find().toArray()
      res.send(result)
    })

    // users collection post 
    app.post('/users',async(req,res)=>{
      const user = req.body;
      const query = {email:user?.email}
      const extingUser = await userCollection.findOne(query)
      
      if(extingUser){
        return res.send({message:'already user exting'})
      }
      const result = await userCollection.insertOne(user);
      res.send(result)
    })

    // select post api
    app.post('/select',async(req,res)=>{
        const data = req.body
        const result = await feadbackCollection.insertOne(data)
        res.send(result)
      })
    

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/',(req,res)=>{
    res.send('boss is siting')
})

app.listen(port,()=>{
    console.log(`server is runnnig ${port}`)
})