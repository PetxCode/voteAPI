const express = require("express");
const multer = require("multer");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;
const path = require("path");
const jwt = require("jsonwebtoken");
const router = express.Router();
const candidatesModel = require("./utils/model");
const userModel = require("./utils/userModel");

cloudinary.config({
  cloud_name: "dry8nywub",
  api_key: "629241972579982",
  api_secret: "Pc2-culzxkssn7oX8SIZoMLR6vc"
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  }
});

const upload = multer({ storage: storage }).single("picture");

const verified = async (req, res, next) => {
  try {
    const authCheck = req.headers.authorization;

    if (authCheck) {
      const token = authCheck.split(" ")[1];
      jwt.verify(token, "THIsthe_newOne", (error, payload) => {
        if (error) {
          res.status(400).json({ message: `Error found ${error.message}` });
        } else {
          req.user = payload;
          next();
        }
      });
    }
  } catch (err) {
    res.status(400).json({ message: `Error found ${err.message}` });
  }
};

router.get("/", async (req, res) => {
  try {
    const candidates = await candidatesModel.find();
    res
      .status(200)
      .json({ message: "candidates found successfully", data: candidates });
  } catch (err) {
    res.status(400).json({ message: `Error found ${err.message}` });
  }
});

router.get("/voters", async (req, res) => {
  try {
    const candidates = await userModel.find();
    res
      .status(200)
      .json({ message: "voters found successfully", data: candidates });
  } catch (err) {
    res.status(400).json({ message: `Error found ${err.message}` });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const candidates = await candidatesModel.findById(req.params.id);
    res
      .status(200)
      .json({ message: "found individual successfully", data: candidates });
  } catch (err) {
    res.status(400).json({ message: `Error found ${err.message}` });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await candidatesModel.findByIdAndRemove(req.params.id);
    res.status(200).json({ message: "remove individual successfully" });
  } catch (err) {
    res.status(400).json({ message: `Error found ${err.message}` });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { points } = req.body;
    const candidates = await candidatesModel.findByIdAndUpdate(
      req.params.id,
      {
        points,
        voters: []
      },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "found individual successfully", data: candidates });
  } catch (err) {
    res.status(400).json({ message: `Error found ${err.message}` });
  }
});

router.post("/", verified, upload, async (req, res) => {
  try {
    if (req.user.isAdmin) {
      const { name, points, position, voters } = req.body;

      const images = await cloudinary.uploader.upload(req.file.path);

      const candidates = await candidatesModel.create({
        name,
        points,
        position,
        voters,
        picture: (await images).secure_url
      });
      res
        .status(200)
        .json({ message: "candidate created successfully", data: candidates });
    }
  } catch (err) {
    res.status(400).json({ message: `Error found ${err.message}` });
  }
});

router.get("/voters/:id", async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    res
      .status(200)
      .json({ message: "single user found successfully", data: user });
  } catch (err) {
    res.status(400).json({ message: `Error found ${err.message}` });
  }
});

router.post("/voters/register", upload, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const images = await cloudinary.uploader.upload(req.file.path);

    const user = await userModel.create({
      name,
      email,
      password: hash,
      picture: images.secure_url
    });
    res.status(200).json({ message: "user created successfully", data: user });
  } catch (err) {
    res.status(400).json({ message: `Error found ${err.message}` });
  }
});

router.post("/voters/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const checkForEmail = await userModel.findOne({ email });
    if (checkForEmail) {
      const checkForPassword = await bcrypt.compare(
        password,
        checkForEmail.password
      );

      if (checkForPassword) {
        const { password, ...info } = checkForEmail._doc;
        const token = jwt.sign(
          {
            _id: checkForEmail._id,
            email: checkForEmail.email,
            isAdmin: checkForEmail.isAdmin
          },
          "THIsthe_newOne",
          { expiresIn: "2d" }
        );
        res.status(200).json({
          message: "users found successfully",
          data: { ...info, token }
        });
      } else {
        res.status(400).json({ message: `Error found as Password not seen` });
      }
    } else {
      res.status(400).json({ message: `Error found as Email not seen` });
    }
  } catch (err) {
    res.status(400).json({ message: `Error found ${err.message}` });
  }
});

module.exports = router;
