const mongoose = require("mongoose");

const Hikingschema = new mongoose.Schema({
  image: String,
  name: String,
  location: {
    lat: Number,
    lng: Number,
  },
  rating: Number,
  desc: {
    Trail: String,
    About: String,
    Difficulty: String,
  },
  SpecialId: String
});

 
module.exports = mongoose.model("Hiking", Hikingschema);
 
