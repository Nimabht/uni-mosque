import express, { Express, NextFunction, Request, Response } from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";
// import apiRouter from "./routes/api";
// import { join } from "path";
// import viewsRouter from "./routes/views";
// import cookieParser from "cookie-parser";
// import checkDatabaseHealth from "./handlers/serverHealthHandler";
const app: Express = express();
// app.use(express.static(join(__dirname, "../public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(cookieParser());
app.set("view engine", "ejs");
// app.set("views", join(__dirname, "../views"));
app.use(express.static("public"));

//Health and ready endpoits

app.get("/ready", (req: Request, res: Response, next: NextFunction) => {
  res.json({ ready: true });
});

// app.get(base_url+ "/healthy",checkDatabaseHealth)

// app.use(base_url + "/api", apiRouter);
// app.use(base_url + "/", viewsRouter);

app.use(globalErrorHandler);
export default app;
