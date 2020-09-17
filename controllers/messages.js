const fs = require("fs");
const WebSocket = require("ws");
const ws = new WebSocket("ws://localhost:3000");
const joi = require("joi");

const messageSchema = joi.object({
  message: joi.string().min(5).required(),
  author: joi.string().required().pattern(new RegExp("^[a-zA-Z]+ [a-zA-Z]+$")),
  ts: joi.number(),
});

let messages = [].concat(JSON.parse(fs.readFileSync("./m.json")));

/* Util Methods */

const buildMessage = (message) => {
  console.log(message);
  let newMessage = {
    message: message.message,
    author: message.author,
    ts: new Date().getTime(),
  };
  return newMessage;
};

const addMessage = (message) => {
  messages.push(buildMessage(message));
  persist();
  return messages;
};

const persist = () => {
  fs.writeFileSync("./m.json", JSON.stringify(messages));
};

/* Web Socket Methods */

exports.wsGetMessages = messages;
exports.wsCreateMessage = addMessage;

/* HTTP Methods */

exports.getAllMessages = (req, res, next) => {
  res.status(200).send(messages);
};

exports.getMessageByTs = (req, res, next) => {
  let message = messages.find((item) => item.ts === parseInt(req.params.ts));
  if (!message)
    return res.status(404).send("The message with the given ts was not found.");
  res.status(200).send(message);
};

exports.createMessage = (req, res, next) => {
  const { error } = messageSchema.validate(req.body);
  if (error) return res.status(400).send(error);

  addMessage(req.body);
  res.status(201).send(messages);
  ws.send("");
};

exports.updateMessage = (req, res, next) => {
  let index = messages.findIndex((item) => item.ts === parseInt(req.body.ts));
  const { error } = messageSchema.validate(req.body);
  if (index < 0)
    return res.status(404).send("The message with the given ts was not found.");
  if (error) return res.status(400).send(error);

  messages[index] = buildMessage(req.body);
  persist();
  res.status(200).send(messages);
  ws.send("");
};

exports.deleteMessage = (req, res, next) => {
  let index = messages.findIndex((item) => item.ts === parseInt(req.params.ts));
  if (index < 0)
    return res.status(404).send("The message with the given ts was not found.");
  /* TODO change splice */
  messages.splice(index, 1);
  persist();
  res.status(200).send(messages);
  ws.send("");
};
