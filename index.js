const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ================= SCHEMA =================
const EspDataSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true
  },
  data: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Collection name: esp_data
const EspData = mongoose.model("esp_data", EspDataSchema);

// ================= ESP POST API =================
app.post("/api/data", async (req, res) => {
  try {
    const { deviceId, data } = req.body;

    // Validation
    if (!deviceId || !data) {
      return res.status(400).json({
        error: "deviceId and data are required"
      });
    }

app.post("/api/data", async (req, res) => {
  console.log("==== ESP REQUEST RECEIVED ====");
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);

  res.status(200).json({ received: req.body });
});



    // Save to MongoDB
    await EspData.create({
      deviceId,
      data
    });

    res.status(200).json({
      status: "success",
      message: "Data saved to MongoDB"
    });

  } catch (error) {
    console.error("Save error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ================= DASHBOARD GET API =================
app.get("/api/data", async (req, res) => {
  const data = await EspData.find().sort({ createdAt: -1 });
  res.json(data);
});

// ================= SERVER =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
