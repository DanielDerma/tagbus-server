"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const notifications_routes_1 = __importDefault(require("./routes/notifications.routes"));
require("dotenv").config();
const app = (0, express_1.default)();
const serviceAccount = require("./sdk_tagbus.json");
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(serviceAccount),
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("notifications", notifications_routes_1.default);
app.listen(process.env.PORT || 8080, () => console.log("Server is running on port 8080"));
