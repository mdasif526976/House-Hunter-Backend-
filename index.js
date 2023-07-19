const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = 5000;
const colors = require("colors");
const jwt = require("jsonwebtoken");

// middlewire
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("all is ok");
});
// database connect //
const uri = process.env.URI;
console.log(uri);
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
const createToken = (email) => {
  const token = jwt.sign({ email }, process.env.Access_Token);
  return token;
};
const run = async () => {
  try {
    // collection in database
    const usersCollection = client.db("House-Hunter").collection("users");

    //sign up user
    app.post("/user", async (req, res) => {
      const data = req.body;
      const users = await usersCollection.find(req.query).toArray();
      const isUserStore = users.find((user) => user.email == data.email);
      if (isUserStore) {
        console.log(isUserStore);
        res.send({ message: "Email is Already Used" });
        console.log("sdfsd");
        return;
      }
      const result = await usersCollection.insertOne(data);
      if (result.acknowledged) {
        const user = await usersCollection.findOne({ email: data.email });
        const token = createToken(user.email);
        console.log(token);
        if (typeof token == "string") {
          const data = { userDetail: user, token: token };
          res.send(data);
        }
      }
    });

    //user login
    app.get("/user", async (req, res) => {
      const email = req.query.email;
      const password = req.query.password;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (!user) {
        res.send({ message: "Email Not match" });
        return;
      } else {
        if (user.password == password) {
          const token = createToken(user.email);
          console.log(token);
          if (typeof token == "string") {
            const data = { userDetail: user, token: token };
            res.send(data);
          }
        }
      }
    });
  } finally {
  }
};
run().catch((err) => console.log(err));
app.listen(port, () => {
  console.log(`Server Running on ${port}`.green);
});
