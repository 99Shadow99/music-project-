const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    trim: true,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    trim: true,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  songs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song"
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);

