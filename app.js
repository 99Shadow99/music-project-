const express = require("express");
const app = express();
const db = require("./config/mongooseConfig.js");
const userModel = require("./models/userModel.js");
var cookieParser = require("cookie-parser");
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const songModel = require("./models/songModel.js");
// Import node-fetch to make API requests
const cors = require("cors");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const ytdl = require("ytdl-core");



const ytdlp = require("yt-dlp-exec");


app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", async (req, res) => {
  res.render("login.ejs");
});
const auth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    const decode = jwt.verify(token, "screat sss");
    if (decode) {
      req.user = decode;
      next();
    } else {
      res.redirect("/");
    }
  } else {
    res.redirect("/");
  }
};

//login
app.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email });
    //user check
    if (user) {
      const result = await bcrypt.compare(password, user.password);
      if (result) {
        var token = jwt.sign(
          { user: user.userName, user: user.email },
          "screat sss"
        );

        if (user.isAdmin) {
          res.cookie("jwt", token);
          res.redirect("/admin");
        } else {
          res.cookie("jwt", token);
          res.redirect("/home");
        }
      } else {
        res.redirect("/");
      }
    } else {
      res.redirect("/register");
    }
  } catch (err) {
    console.error("Error in login:", err);
    res.status(500).json({ error: "Error in login" });
  }
});

app.get("/register", async (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  try {
    const { userName, password, email } = req.body;
    const isAdmin = req.body.isAdmin === "true";
    const user = await userModel.findOne({ email: email });
    if (user) {
      res.redirect("/");
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log(hashedPassword);
      await userModel.create({
        userName: userName,
        email: email,
        password: hashedPassword,
        isAdmin: isAdmin,
      });
      res.redirect("/");
    }
  } catch (err) {
    console.error("Error creating user:", err); // ✅ Logs the actual error
    res.status(500).json({ error: "Error in creating user" });
  }
});

app.get("/home", auth, async (req, res) => {
  res.render("home.ejs");
});

app.get("/admin", async (req, res) => {
  const data = await songModel.find({});
  res.render("admin.ejs", { data: data });
});
app.post("/admin", async (req, res) => {
  const { song, album, artist } = req.body;
  await songModel.create({
    song: song,
    album: album,
    artist: artist,
  });
  res.redirect("/admin");
});

// Use yt-dlp-exec instead of ytdl

const apiKey = "AIzaSyDQw9XRawV-EXHmeUdsB5KL2HGb3mp1AoQ";

app.get("/search", async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: "Missing search query" });
  }
//url yt api
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
    query
  )}&type=video&maxResults=1&key=${apiKey}`;

  try {
    const response = await fetch(searchUrl);
    const data = await response.json();
    //check 
    if (!data.items || data.items.length === 0) {
      return res.status(404).json({ error: "No videos found" });
    }

    const videoId = data.items[0].id.videoId;
    const videoTitle = data.items[0].snippet.title;
    // url 2
    const itunesURL = `https://itunes.apple.com/search?term=${encodeURIComponent(
      videoTitle
    )}&media=music&limit=1`;
    const itunesRes = await fetch(itunesURL);
    const itunesData = await itunesRes.json();

    let trackInfo = null;
    //check
    if (itunesData.results.length > 0) {
      const track = itunesData.results[0];
      trackInfo = {
        title: track.trackName,
        artist: track.artistName,
        album: track.collectionName,
        artwork: track.artworkUrl100,
        previewUrl: track.previewUrl,
        genre: track.primaryGenreName,
        releaseDate: track.releaseDate,
      };
    }
    console.log("Track Info:", trackInfo); // Log the track info for debugging

    res.json({ videoId });
  } catch (error) {
    console.error("YouTube API Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch YouTube data" });
  }
});

// ✅ Audio route — converts videoId to direct audio stream URL
app.get("/audio", async (req, res) => {
  const videoId = req.query.videoId;
  if (!videoId) return res.status(400).json({ error: "Missing videoId" });

  try {
    const url = `https://www.youtube.com/watch?v=${videoId}`;

    const audioUrl = await ytdlp(url, {
      format: "bestaudio",
      getUrl: true,
      "no-check-certificate": true, // ✅ Corrected flag
    });

    res.json({ audioUrl: audioUrl.trim() });
  } catch (error) {
    console.error("Error fetching audio:", error);
    res.status(500).json({ error: "Error fetching audio" });
  }
});

app.get("/logout", async (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
