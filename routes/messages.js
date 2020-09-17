const express = require("express");
const messageController = require("../controllers/messages");

const router = express.Router();

router
  .route("/")
  .get(messageController.getAllMessages)
  .post(messageController.createMessage)
  .put(messageController.updateMessage);

router
  .route("/:ts")
  .get(messageController.getMessageByTs)
  .delete(messageController.deleteMessage);

module.exports = router;
