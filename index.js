const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken')
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.mp2urfi.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const servicesCollection = client.db("carDoctor").collection("services");
    const orderCollection = client.db("carDoctor").collection("order");

    // ================
    // get service data
    // ================
    app.get('/services',async(req, res)=>{
        const cursor = servicesCollection.find()
        const result = await cursor.toArray();
        res.send(result)
    })


    /*****************************
     * get services data details
     * ****************************
     */
    app.get('/services/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)};
      const options = {
        projection: { title: 1, img:1 , price:1, service_id: 1},
      };
      const result = await servicesCollection.findOne(query, options);
      res.send(result)
    })
    

    /*****************************
     * get order details 
     * **************************
     */
    app.get('/order', async(req, res)=>{
      let query;
      const email = req.query?.email
      if (req.query?.email) {
        query = {email: email}
      }
      const result = await orderCollection.find(query).toArray();
      res.send(result)
      console.log(req.query.email);
    })


    /********************
     * create order
     * ******************
     */
    app.post('/order',async(req, res)=>{
      const info = req.body;
      const result =await orderCollection.insertOne(info);
      res.send(result)
    })


    /**********************
     * jwt token
     * ********************
     */
    app.post('/jwt', async(req,res) =>{
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, 'secrete', {expiresIn: '1h'})
      res.send({user, token})
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



app.listen(port, ()=>{
    console.log('server is running on port', port);
})