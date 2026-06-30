const router = require("express").Router();
const auth = require("../middleware/auth");
const { microPlan, prioritize, voiceAssist } = require("../controllers/aiController");

router.use(auth);
router.post("/micro-plan", microPlan);
router.post("/prioritize", prioritize);
router.post("/voice-assist", voiceAssist);

module.exports = router;
