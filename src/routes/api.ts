import express from "express";
import authRouter from "./auth";
import userRouter from "./user";
import availableTimeRouter from "./availableTime";

const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/user", userRouter);
apiRouter.use("/available-time", availableTimeRouter);

export default apiRouter;
