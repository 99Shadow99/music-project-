const mongoose=require("mongoose");

mongoose.connect("mongodb://localhost:27017/music-player-project")
.then(() => console.log("✅ Connected to MongoDB successfully!"))
  .catch(err => console.error("❌ Error connecting to MongoDB:", err));

const db=mongoose.connection;
exports.db=db;