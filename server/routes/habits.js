const router = require("express").Router();
const auth = require("../middleware/auth");
const { getHabits, createHabit, logHabit, deleteHabit } = require("../controllers/habitController");

router.use(auth);
router.get("/", getHabits);
router.post("/", createHabit);
router.put("/:id/log", logHabit);
router.delete("/:id", deleteHabit);

module.exports = router;
