const admin = require("firebase-admin");
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const serviceAccount = require("./sdk_tagbus.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

app.use(cors());
app.use(express.json());

app.get("/hello-world", (req, res) => {
  return res.status(200).send("Hello World2!");
});

app.use(require("./routes/notifications.routes.js"));

app.listen(process.env.PORT || 8080, () =>
  console.log("Server is running on port 8080")
);
