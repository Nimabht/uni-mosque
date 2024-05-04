import express, { Express, NextFunction, Request, Response } from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import apiRouter from "./routes/api";
const app: Express = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.static("public"));

//Health and ready endpoits

app.get("/ready", (req: Request, res: Response, next: NextFunction) => {
  res.json({ ready: true });
});

app.use("/api", apiRouter);

app.use(globalErrorHandler);
export default app;
