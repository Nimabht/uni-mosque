import express from "express";
import authRouter from "./auth";
// import userRouter from "./user";
// import clientRouter from "./client";
// import dockerRouter from "./docker";
// import { USAGE_MODE } from "../config";

const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
// apiRouter.use("/user", userRouter);
// apiRouter.use("/client", clientRouter);

export default apiRouter;
