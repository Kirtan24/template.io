const express = require("express");
const router = express.Router();
const controller = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/logout", authMiddleware, controller.logout);
router.post("/forgot-password", controller.forgotPassword);
router.post("/reset-password", controller.resetPassword);
router.get("/validate-token", controller.validateToken);

module.exports = router;
