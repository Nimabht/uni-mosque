import express, { Router } from "express";
import asyncMiddleware from "../middlewares/async";
import jwtValidator from "../middlewares/auth/jwtValidator";
import hasAccessByRole from "../middlewares/auth/hasAccessByRole";
import userController from "../controllers/user";
import { uploadLogo } from "../utils/multerConfig";
import mosqueProfileController from "./../controllers/mosquePrfile";

const router: Router = express.Router();

router.get("", [], asyncMiddleware(mosqueProfileController.getProfile));

router.get("/logo", [], asyncMiddleware(mosqueProfileController.getLogo));

router.put(
  "",
  [jwtValidator, hasAccessByRole(["Admin"])],
  asyncMiddleware(mosqueProfileController.editProfile),
);

router.patch(
  "/logo",
  [jwtValidator, hasAccessByRole(["Admin"]), uploadLogo],
  asyncMiddleware(mosqueProfileController.uploadLogo),
);

export default router;
