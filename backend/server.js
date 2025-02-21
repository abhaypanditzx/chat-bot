require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { OpenAI } = require("openai");

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Define a schema for chat messages
const ChatSchema = new mongoose.Schema({
  message: String,
  sender: String, // 'user' or 'bot'
  timestamp: { type: Date, default: Date.now },
});

const Chat = mongoose.model("Chat", ChatSchema);

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// API route to handle chat messages
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    // Save user message in DB
    const userMessage = new Chat({ message, sender: "user" });
    await userMessage.save();

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      store:true,
      messages: [{ role: "user", content: message }],
    });

    const botMessage = response.choices[0].message.content;

    // Save bot response in DB
    const botReply = new Chat({ message: botMessage, sender: "bot" });
    await botReply.save();

    res.json({ reply: botMessage });
  } catch (err) {
    console.error("OpenAI API Error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
