import express from "express";
import {
  sendMessage,
  getMessages,
  listCustomers,
  adminGetMessages,
  adminSend,
  getUnreadCustomers,
  markMessagesSeen,
} from "../controllers/chatController.js";

const router = express.Router();

router.post("/", sendMessage);
router.get("/", getMessages);
router.get("/customers", listCustomers);
router.get("/admin/unread", getUnreadCustomers);
router.get("/admin", adminGetMessages);
router.post("/admin/seen", markMessagesSeen);
router.post("/admin/send", adminSend);

export default router;
