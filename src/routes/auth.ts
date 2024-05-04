import express from "express";
import asyncMiddleware from "../middlewares/async";
import authController from "../controllers/auth";
// import activityLoggerMiddleware from "../middlewares/activityLoggerMiddleware";

const router = express.Router();

// router.param("userId", getUser);

router.post("/signup", asyncMiddleware(authController.signup));
router.post("/login", asyncMiddleware(authController.login));
// router.get(
//   "/logout",
//   checkSessionValidity,
//   asyncMiddleware(authController.logoutUser),
// );
export default router;
