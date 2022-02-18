const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const port = process.env.PORT || 9009;
const url = "mongodb://localhost/election";
const url_online =
  "mongodb+srv://AuthClass:AuthClass@codelab.u4drr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const app = express();

mongoose.connect(url_online).then(() => {
  console.log("database connected");
});

app.use(cors());
app.use(express.json());

app.use("/api", require("./router"));

app.use("/", async (req, res) => {
  res.end("Welcome to Our voting API server");
});

app.listen(port, () => {
  console.log("server is connected");
});
