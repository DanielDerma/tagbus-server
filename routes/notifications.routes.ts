import { Expo, ExpoPushMessage } from "expo-server-sdk";
import { Router } from "express";

import admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

import { NotificationType, TokenDocType } from "../types";

const router = Router();
const db = admin.firestore();

let expo = new Expo();

router.get("/send", async (req, res) => {
  const { title, body, route } = req.body;
  const users = await db.collection("users").where("route", "==", route).get();

  const validIds = users.docs.map((user) => user.id);

  const validTokens = validIds.map(async (uid) => {
    const tokenDoc = await db.collection("tokens").doc(uid).get();

    if (tokenDoc.exists) {
      const tokenData = tokenDoc.data() as TokenDocType;
      return tokenData.token;
    }
    return null;
  });

  const allTokens = await Promise.all(validTokens);

  let messages = [] as ExpoPushMessage[];
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
    });
  }

  // send push notifications
  let chunks = expo.chunkPushNotifications(messages);
  for (let chunk of chunks) {
    const firebaseNotification: NotificationType = {
      title,
      body,
      route,
      createdAt: Timestamp.now(),
    };
    try {
      await expo.sendPushNotificationsAsync(chunk);
      await db.collection("notifications").add(firebaseNotification);
    } catch (error) {
      console.error(error);
    }
  }

  res.json({ messages });
});

export default router;
