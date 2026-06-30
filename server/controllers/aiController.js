const axios = require("axios");

const AI_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

exports.microPlan = async (req, res) => {
  try {
    const { data } = await axios.post(`${AI_URL}/ai/micro-plan`, req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.response?.data?.detail || err.message });
  }
};

exports.prioritize = async (req, res) => {
  try {
    const { data } = await axios.post(`${AI_URL}/ai/prioritize`, req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.response?.data?.detail || err.message });
  }
};

exports.voiceAssist = async (req, res) => {
  try {
    const { data } = await axios.post(`${AI_URL}/ai/voice-assist`, req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.response?.data?.detail || err.message });
  }
};
