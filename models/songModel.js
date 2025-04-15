const mongoose = require("mongoose");

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    // required: true,
    trim: true
  },
  artist: {
    type: String,
    trim: true
  },
  album: {
    type: String,
    trim: true
  },
  duration: {
    type: String
  },
  image: {
    type: String,
    default: "https://picsum.photos/seed/picsum/200/300"
  },
  audioUrl: {
    type: String,
    // required: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

module.exports = mongoose.model("Song", songSchema);
