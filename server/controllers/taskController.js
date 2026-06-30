const Task = require("../models/Task");

const urgencyScore = (task) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const deadline = new Date(task.date + "T00:00:00");
  const daysLeft = Math.ceil((deadline - today) / 86400000);
  const effortDays = task.effort / 480;
  if (daysLeft <= 0) return 100;
  if (daysLeft <= 1) return 90 + effortDays * 5;
  if (daysLeft <= 3) return 70 + effortDays * 8;
  if (daysLeft <= 7) return 40 + effortDays * 5;
  return Math.max(5, 30 - daysLeft);
};

const urgencyLevel = (score) => {
  if (score >= 85) return "critical";
  if (score >= 60) return "high";
  if (score >= 30) return "medium";
  return "low";
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ date: 1 });
    const enriched = tasks.map((t) => {
      const score = urgencyScore(t);
      return { ...t.toObject(), urgencyScore: Math.round(score), priority: urgencyLevel(score) };
    });
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { name, date, effort } = req.body;
    const task = await Task.create({ user: req.user.id, name, date, effort });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
