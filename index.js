const express = require('express')
const app = express()
var cors = require('cors')
require('dotenv').config()
const { MongoClient } = require('mongodb')

const port = process.env.PORT || 5000

// middle ware
app.use(cors())
app.use(express.json())

// user: ema-john-user
//pass: Nn9sFB5Im5JOJ8Ip

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hoqfp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

async function run () {
  try {
    // Database
    await client.connect()
    const database = client.db('ema-john-db')
    const productsCollection = database.collection('products-collection')

    // GET API
    app.get('/products', async (req, res) => {
      const cursor = productsCollection.find({})

      const page = req.query.page
      const size = parseInt(req.query.size)
      let products
      const count = await cursor.count()

      if (page) {
        products = await cursor
          .skip(page * size)
          .limit(size)
          .toArray()
      } else {
        products = await cursor.toArray()
      }

      res.send({
        count,
        products
      })
    })

    // use post  to get products by keys
    app.post('/products/byKeys', async (req, res) => {
      const keys = req.body
      const query = { key: { $in: keys } }
      const products = await productsCollection.find(query).toArray()

      res.json(products)
    })

    //POST API
    app.post('/addProducts', async (req, res) => {
      const product = req.body
      const result = await productsCollection.insertOne(product)
      res.json({ result })
    })
  } finally {
    // await client.close();
  }
}
run().catch(console.dir)

app.get('/', async (req, res) => {
  res.send('Ema john Server is running')
})

app.listen(port, () => {
  console.log('listing to port:', port)
})
