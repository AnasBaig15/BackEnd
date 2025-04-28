const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  fullname:{
    type:String,
    minLength: 3,
    trim: true,
},
email:String,
password: String,
  createdAt: { type: Date, default: Date.now },
  isAdmin: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", userSchema);
