import type { Timestamp } from "firebase-admin/firestore";

export type TokenDocType = {
  token: string;
};

export type NotificationType = {
  id?: string;
  title: string;
  body: string;
  route: string;
  createdAt: Timestamp;
};
