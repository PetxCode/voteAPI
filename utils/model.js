const mongoose = require("mongoose");
const Model = mongoose.Schema(
  {
    name: { type: String },
    points: { type: Number },
    position: { type: String },
    picture: { type: String },
    voters: { type: Array }
  },
  { timestaps: true }
);

module.exports = mongoose.model("candidates", Model);
