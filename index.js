const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

const SensorSchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  createdAt: { type: Date, default: Date.now }
});

const Sensor = mongoose.model("Sensor", SensorSchema);

// POST data from ESP8266
app.post("/api/data", async (req, res) => {
  const data = new Sensor(req.body);
  await data.save();
  res.send({ status: "success" });
});

// GET data for dashboard
app.get("/api/data", async (req, res) => {
  const data = await Sensor.find().sort({ createdAt: -1 });
  res.json(data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
