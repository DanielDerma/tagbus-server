const { Expo } = require("expo-server-sdk");
const { Router } = require("express");
const router = Router();

const admin = require("firebase-admin");
const db = admin.firestore();

let expo = new Expo();

router.get("/sendPushNotification", async (req, res) => {
  const route = "tecDelicias";
  const users = await db.collection("users").where("route", "==", route).get();

  const validIds = users.docs.map((user) => user.id);
  const validTokens = validIds.map(async (uid) => {
    const tokenDoc = await db.collection("tokens").doc(uid).get();
    return tokenDoc.data().token;
  });

  const allTokens = await Promise.all(validTokens);

  let messages = [];
  for (let pushToken of allTokens) {
    // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
    messages.push({
      to: pushToken,
      sound: "default",
      body: "This is a test notification",
      title: "hola",
      data: { withSome: "data" },
    });
  }

  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log(ticketChunk);
      tickets.push(...ticketChunk);
      // NOTE: If a ticket contains an error code in ticket.details.error, you
      // must handle it appropriately. The error codes are listed in the Expo
      // documentation:
      // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
    } catch (error) {
      console.error(error);
    }
  }

  res.json({ messages });
});

module.exports = router;
