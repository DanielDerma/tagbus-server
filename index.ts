import admin from "firebase-admin";
import express from "express";
import cors from "cors";

import NotificationsRoute from "./routes/notifications.routes";

require("dotenv").config();

const app = express();

const serviceAccount = require("./sdk_tagbus.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(cors());
app.use(express.json());

app.use("notifications", NotificationsRoute);

app.listen(process.env.PORT || 8080, () =>
  console.log("Server is running on port 8080")
);
