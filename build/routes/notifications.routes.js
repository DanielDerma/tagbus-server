"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const expo_server_sdk_1 = require("expo-server-sdk");
const express_1 = require("express");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const router = (0, express_1.Router)();
const db = firebase_admin_1.default.firestore();
let expo = new expo_server_sdk_1.Expo();
router.get("/send", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, body, route } = req.body;
    const users = yield db.collection("users").where("route", "==", route).get();
    const validIds = users.docs.map((user) => user.id);
    const validTokens = validIds.map((uid) => __awaiter(void 0, void 0, void 0, function* () {
        const tokenDoc = yield db.collection("tokens").doc(uid).get();
        if (tokenDoc.exists) {
            const tokenData = tokenDoc.data();
            return tokenData.token;
        }
        return null;
    }));
    const allTokens = yield Promise.all(validTokens);
    let messages = [];
    for (let pushToken of allTokens) {
        if (!expo_server_sdk_1.Expo.isExpoPushToken(pushToken)) {
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
        const firebaseNotification = {
            title,
            body,
            route,
            createdAt: firestore_1.Timestamp.now(),
        };
        try {
            yield expo.sendPushNotificationsAsync(chunk);
            yield db.collection("notifications").add(firebaseNotification);
        }
        catch (error) {
            console.error(error);
        }
    }
    res.json({ messages });
}));
exports.default = router;
