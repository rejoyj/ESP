const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());

// ------------------------------------
// MongoDB Connection
// ------------------------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// ------------------------------------
// Schema (UID matches Arduino payload)
// ------------------------------------
const EspDataSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true
  },
  uid: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 🔥 Force collection name
const EspData = mongoose.model("EspData", EspDataSchema, "esp_data");

// ------------------------------------
// POST → Receive RFID UID
// ------------------------------------
app.post("/api/data", async (req, res) => {
  try {
    const { deviceId, uid } = req.body;

    // Validation
    if (!deviceId || !uid) {
      return res.status(400).json({
        error: "Invalid payload",
        expected: {
          deviceId: "string",
          uid: "string"
        },
        received: req.body
      });
    }

    // Save to DB
    const savedData = await EspData.create({
      deviceId,
      uid
    });

    res.status(201).json({
      status: "success",
      saved: savedData
    });

  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------------------
// GET → Fetch All RFID Logs
// ------------------------------------
app.get("/api/data", async (req, res) => {
  try {
    const data = await EspData.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// ------------------------------------
// Server Start
// ------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
