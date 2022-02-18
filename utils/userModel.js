const mongoose = require("mongoose");
const Model = mongoose.Schema(
  {
    name: { type: String },
    email: { type: String },
    picture: { type: String },
    password: { type: String },
    isAdmin: { type: Boolean, default: false }
  },
  { timestaps: true }
);

module.exports = mongoose.model("voters", Model);
