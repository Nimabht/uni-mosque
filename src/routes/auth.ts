import express from "express";
import asyncMiddleware from "../middlewares/async";
import authController from "../controllers/auth";

const router = express.Router();

router.post("/signup", asyncMiddleware(authController.signup));
router.post("/login", asyncMiddleware(authController.login));

export default router;
