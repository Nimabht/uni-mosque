// import userController from "../controllers/user";
import express, { Router } from "express";
import asyncMiddleware from "../middlewares/async";
import getUser from "../middlewares/user/getUser";
import jwtValidator from "../middlewares/auth/jwtValidator";
import hasAccessByRole from "../middlewares/auth/hasAccessByRole";
import userController from "../controllers/user";
// import checkSessionValidity from "../middlewares/auth/checkSessionValidity";
// import hasAccessByRole from "../middlewares/auth/hasAccessByRole";
// import { uploadAvatar } from "../utils/multerConfig";
// import hasAccessByOwning from "../middlewares/auth/hasAccessByOwning";
// import hasAccessByAdminOrOwner from "../middlewares/auth/hasAccessByAdminOrOwner";

const router: Router = express.Router();

router.param("userId", getUser);

router.get(
  "",
  [jwtValidator, hasAccessByRole(["Admin"])],
  asyncMiddleware(userController.getAllUsers),
);

router.get(
  "/:userId",
  [jwtValidator, hasAccessByRole(["Admin"])],
  asyncMiddleware(userController.getUserById),
);

router.put(
  "/:userId",
  [jwtValidator, hasAccessByRole(["Admin"])],
  asyncMiddleware(userController.updateUser),
);

router.delete(
  "/:userId",
  [jwtValidator, hasAccessByRole(["Admin"])],
  asyncMiddleware(userController.deleteUser),
);

// router.patch(
//   "/update-avatar/:userId",
//   [
//     checkSessionValidity,
//     hasAccessByOwning,
//     uploadAvatar.single("avatar"),
//   ],
//   asyncMiddleware(userController.updateUserAvatar)
// );

export default router;
