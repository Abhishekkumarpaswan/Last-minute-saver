const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name:     { type: String, required: true, trim: true },
  date:     { type: String, required: true },
  effort:   { type: Number, required: true },
  done:     { type: Boolean, default: false },
  priority: { type: String, enum: ["critical", "high", "medium", "low"], default: "medium" },
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);
