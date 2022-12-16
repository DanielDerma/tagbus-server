const { Expo } = require("expo-server-sdk");
const { Router } = require("express");
const router = Router();

const admin = require("firebase-admin");
const db = admin.firestore();
const { Timestamp } = admin.firestore;

let expo = new Expo();

router.get("/sendPushNotification", async (req, res) => {
  const { title, body, route } = req.body;
  const users = await db.collection("users").where("route", "==", route).get();

  const validIds = users.docs.map((user) => user.id);
  const validTokens = validIds.map(async (uid) => {
    const tokenDoc = await db.collection("tokens").doc(uid).get();
    return tokenDoc.data().token;
  });

  const allTokens = await Promise.all(validTokens);

  let messages = [];
  for (let pushToken of allTokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    messages.push({
      title,
      body,
      sound: "default",
      to: pushToken,
      createdAt: Timestamp.now(),
      data: { withSome: "data" },
    });
  }
  const alumno = {
    grupo: "a",
    grado: 5,
    calificaion: 6,
  };

  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log(ticketChunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error(error);
    }
  }

  res.json({ messages });
});

module.exports = router;
