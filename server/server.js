const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const Hiking = require("./Models/Items");
const cors = require("cors");

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:5173"] }));
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("DB connection failed:", err));

  
// Welcome route
const { MongoClient } = require("mongodb");

app.get("/", async (req, res) => {
  const client = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    const database = client.db(); // Defaults to DB in URI
    const collection = database.collection("hiking");

    const allItems = await collection.find({}).toArray();
    res.json(allItems);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ error: "Database error" });
  } finally {
    await client.close();
  }
});


// Get all hiking data
app.get("/hiking", async (req, res) => {
  try {
    const hikes = await Hiking.find();
    res.json(hikes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch hiking data" });
  }
});

// Get single hiking item by ID
app.get("/hiking/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  try {
    const hike = await Hiking.findById(id);
    if (!hike) {
      return res.status(404).json({ message: "Hiking item not found" });
    }
    res.status(200).json(hike);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Create new hiking entry
app.post("/hiking", async (req, res) => {
  const { name, image, personal } = req.body;

  if (!name || !image) {
    return res
      .status(400)
      .json({ error: "Missing required fields (name, image)" });
  }

  try {
    const newHike = new Hiking({
      name,
      image,
      personal: {
        name: personal?.name || "",
        number: personal?.number || "",
      },
    });

    await newHike.save();
    res.status(201).json(newHike);
  } catch (err) {
    res.status(500).json({ error: "Failed to create hiking item" });
  }
});

// Delete hiking entry by ID
app.delete("/hiking/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  try {
    await Hiking.findByIdAndDelete(id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete hiking item" });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
