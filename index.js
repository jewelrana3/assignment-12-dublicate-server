const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const stripe = require('stripe')(process.env.PAYMENT_SECRET_KEY)
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 3000

// middle ware
app.use(cors())
app.use(express.json());

// const verifyJWT = (req,res,next) =>{
//   const authorization = req.headers.authorization;
//   if(!authorization){
//     return res.status(401).send({error:true,message:'Unauthorization access'})
//   }
//   const token = authorization.split(' ')[1]
//   jwt.verify(token.process.env.JSON_WEB_TOKEN,(err,decoded)=>{
//     if (err) {
//       return res.status(403).send({ error: true, message: 'Unauthorization access not verify' })
//     }
//     decoded = decoded;
//     next();
//   })
// }



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const popularollection = client.db('doctorCamp').collection('popular')
    const instructorCollection = client.db('doctorCamp').collection('instructor')
    const selectCollection = client.db('doctorCamp').collection('select')

    // JWT
    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_JWT, {
        expiresIn: '3d'
      })
      
      res.send({ token })
    })

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

    // popular class
    app.get('/popular',async(req,res)=>{
      const result = await popularollection.find().toArray()
      res.send(result)
    })

    // instructor class
    app.get('/instructor',async(req,res)=>{
      const result = await instructorCollection.find().toArray()
      res.send(result)
    })

  
   

    // select api
      app.get('/select',async(req,res)=>{
        const email = req.query.email;
        if(!email){
          res.send([])
        }
        // const decodedEmail = req.decoded.email;
        // if(email !== decodedEmail){
        //   return res.status(401).send({error:true, message:'forbidden access'})
        // }
        const query = {email:email}
        const result = await selectCollection.find(query).toArray()
        res.send(result)
      })

    // select post api
    app.post('/select',async(req,res)=>{
        const data = req.body
        const result = await selectCollection.insertOne(data)
        res.send(result)
      })

      app.delete('/select/:id',async(req,res)=>{
        const id = req.params.id
        const query = {_id : new ObjectId(id)}
        const result = await selectCollection.deleteOne(query)
        res.send(result)

      })

      // payment intent side
      app.post('/create-payment-intent',async(req,res)=>{
        const {price} = req.body;
        const amount = price * 100
        const paymentIntent = await stripe.paymentIntents.create({
          amount:amount,
          currency:'usd',
          payment_methods_types:['card']
        });
        res.send({
          clientSecret:paymentIntent.client_secret,
        })
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