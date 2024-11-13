import express from "express";
import authRouter from "./auth";
import userRouter from "./user";
import availableTimeRouter from "./availableTime";
import reservation from "./reservation";
import comment from "./comment";
import mosque from "./mosque";
import blog from "./blog";

const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/user", userRouter);
apiRouter.use("/available-time", availableTimeRouter);
apiRouter.use("/reservation", reservation);
apiRouter.use("/comment", comment);
apiRouter.use("/mosque", mosque);
apiRouter.use("/blog", blog);

export default apiRouter;
