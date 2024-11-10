import express, { Router } from "express";
import asyncMiddleware from "../middlewares/async";
import getUser from "../middlewares/user/getUser";
import jwtValidator from "../middlewares/auth/jwtValidator";
import hasAccessByRole from "../middlewares/auth/hasAccessByRole";
import userController from "../controllers/user";
// import { uploadAvatar } from "../utils/multerConfig";
// import hasAccessByOwning from "../middlewares/auth/hasAccessByOwning";
import hasAccessByAdminOrOwner from "../middlewares/user/hasAccessByAdminOrOwner";
import { uploadAvatar } from "../utils/multerConfig";

const router: Router = express.Router();

router.param("userId", getUser);

router.get(
  "",
  [jwtValidator, hasAccessByRole(["Admin"])],
  asyncMiddleware(userController.getAllUsers),
);

router.get(
  "/avatar/:userId",
  [jwtValidator, hasAccessByAdminOrOwner],
  asyncMiddleware(userController.getUserAvatar),
);

router.get(
  "/:userId",
  [jwtValidator, hasAccessByAdminOrOwner],
  asyncMiddleware(userController.getUserById),
);

router.put(
  "/:userId",
  [jwtValidator, hasAccessByAdminOrOwner],
  asyncMiddleware(userController.updateUser),
);

router.delete(
  "/:userId",
  [jwtValidator, hasAccessByRole(["Admin"])],
  asyncMiddleware(userController.deleteUser),
);

router.patch(
  "/update-avatar/:userId",
  [jwtValidator, hasAccessByAdminOrOwner, uploadAvatar],
  asyncMiddleware(userController.updateUserAvatar),
);

export default router;
