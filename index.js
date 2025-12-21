const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ==============================
   ✅ CORS — FIXED (Node 22 SAFE)
   ============================== */
app.use(
  cors({
    origin: "https://project-x-dxq8.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

/* ==============================
   MongoDB Connection
   ============================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

/* ==============================
   Schema
   ============================== */
const EspDataSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
    },
    uid: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const EspData = mongoose.model("EspData", EspDataSchema, "esp_data");

/* ==============================
   POST → ESP sends UID
   ============================== */
app.post("/api/data", async (req, res) => {
  try {
    const { deviceId, uid } = req.body;

    if (!deviceId || !uid) {
      return res.status(400).json({
        error: "Invalid payload",
        expected: { deviceId: "string", uid: "string" },
        received: req.body,
      });
    }

    const savedData = await EspData.create({ deviceId, uid });

    res.status(201).json({
      success: true,
      saved: savedData,
    });
  } catch (error) {
    console.error("❌ POST Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ==============================
   GET → Frontend Table
   ============================== */
app.get("/api/data", async (req, res) => {
  try {
    const data = await EspData.find().sort({ createdAt: -1 });

    const formatted = data.map((item) => {
      const d = new Date(item.createdAt);

      return {
        id: item._id,
        date: d.toLocaleDateString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
        time: d.toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
        link: item.uid,
        note: item.note || "",
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("❌ GET Error:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

/* ==============================
   PUT → Update Note
   ============================== */
app.put("/api/data/:id", async (req, res) => {
  try {
    const { note } = req.body;

    const updated = await EspData.findByIdAndUpdate(
      req.params.id,
      { note },
      { new: true }
    );

    res.json({ success: true, updated });
  } catch (error) {
    console.error("❌ PUT Error:", error);
    res.status(500).json({ error: "Note update failed" });
  }
});

/* ==============================
   Server Start
   ============================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
