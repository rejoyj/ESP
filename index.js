const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// 🔥 ONE schema, ONE collection
const EspDataSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  data: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// 🔥 FORCE collection name
const EspData = mongoose.model("EspData", EspDataSchema, "esp_data");

// POST
app.post("/api/data", async (req, res) => {
  const { deviceId, data } = req.body;

  if (!deviceId || !data) {
    return res.status(400).json({ error: "Invalid payload", body: req.body });
  }

  const doc = await EspData.create({ deviceId, data });

  res.json({ status: "success", saved: doc });
});

// GET
app.get("/api/data", async (req, res) => {
  const docs = await EspData.find().sort({ createdAt: -1 });
  res.json(docs);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));
