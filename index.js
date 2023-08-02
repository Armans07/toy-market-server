const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// Middlewere

app.use(cors());
app.use(express.json());

console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xxlectq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    client.connect((error) => {
      if (error) {
        console.log(error);
        return;
      }
    });

    const toyCollections = client.db("toyShop").collection("toyAdd");

    const indexKeys = { toyName: -1 };
    const indexOptions = { name: "toyName" };

    const result = await toyCollections.createIndex(indexKeys, indexOptions);

    app.get("jobsSearchByName/:text", async (req, res) => {
      const searchText = req.params.text;

      const result = await toyCollections
        .find({
          $or: [
            {
              toyName: { $regex: text, $options: "i" },
            },
          ],
        })
        .toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // Sub Category

    app.get("alltoy/:category", async (req, res) => {
      const result = await toyCollections
        .find({ category: req.params.category })
        .toArray();
      res.send(result);
    });

    // All toys

    app.get("/alltoy", async (req, res) => {
      const result = await toyCollections
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });

    app.get("/alltoy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollections.findOne(query);
      res.send(result);
    });

    //  Add toy

    app.post("/addtoy", async (req, res) => {
      const body = req.body;
      body.createdAt = new Date();

      const result = await toyCollections.insertOne(body);
      console.log(result);
      if (!body) {
        return res.status(404).send({ message: "body data not found" });
      }
      res.send(result);
    });

    // My toy

    app.get("/mytoy/:email", async (req, res) => {
      const result = await toyCollections
        .find({ sellerEmail: req.params.email })
        .toArray();
      res.send(result);
    });

    // Update toy

    app.put("/updatedToy/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          toyName: body.toyName,
          category: body.category,
        },
      };
      const result = await toyCollections.updateOne(filter, updatedDoc);
      res.send(result)
    });

    // Delete toy

    app.delete("/remove/:id", async (req, res) => {
      const result = await toyCollections.deleteOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Toy is running");
});

app.listen(port, () => {
  console.log(`Toy shop server is running in port ${port}`);
});
