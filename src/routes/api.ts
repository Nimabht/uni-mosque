import express from "express";
import authRouter from "./auth";
import userRouter from "./user";
import availableTimeRouter from "./availableTime";
import reservation from "./reservation";

const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/user", userRouter);
apiRouter.use("/available-time", availableTimeRouter);
apiRouter.use("/reservation", reservation);

export default apiRouter;
