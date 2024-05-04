import { createServer } from "node:http";
import dotenv from "dotenv";

dotenv.config();

if (!!process.env.error) {
  console.log(process.env.error);
  process.exit(1);
}

import app from "./index";
// import { logger } from "./utils/logger/logger";
// import connectToMongoDatabase from "./db/mongo/connection";
// import initializeAdminUser from "./utils/mongoInitializeAdminUser";
// import { USAGE_MODE } from "./config";

const server = createServer(app);

const host = process.env.HOST || "0.0.0.0";
const port = process.env.PORT || 7005;

server.listen(+port, host, () => {
  console.log(`[🔥] App is listening on ${host}:${port}...`);
});
