import express, { Router } from "express";
import asyncMiddleware from "../middlewares/async";
import jwtValidator from "../middlewares/auth/jwtValidator";
import hasAccessByRole from "../middlewares/auth/hasAccessByRole";
import availableTimeController from "../controllers/availableTime";
import getAvailableTime from "../middlewares/availableTime/getAvailableTime";

const router: Router = express.Router();

router.param("availableTimeId", getAvailableTime);

router.get(
  "",
  [jwtValidator, hasAccessByRole(["Admin", "User"])],
  asyncMiddleware(availableTimeController.getAllAvailableTime),
);

router.post(
  "",
  [jwtValidator, hasAccessByRole(["Admin"])],
  asyncMiddleware(availableTimeController.createAvailableTime),
);

router.delete(
  "/:availableTimeId",
  [jwtValidator, hasAccessByRole(["Admin"])],
  asyncMiddleware(availableTimeController.deleteAvailableTime),
);
// router.get(
//   "/:userId",
//   [jwtValidator, hasAccessByRole(["Admin"])],
//   asyncMiddleware(userController.getUserById),
// );

// router.put(
//   "/:userId",
//   [jwtValidator, hasAccessByAdminOrOwner],
//   asyncMiddleware(userController.updateUser),
// );

// router.patch(
//   "/update-avatar/:userId",
//   [jwtValidator, hasAccessByAdminOrOwner, uploadAvatar],
//   asyncMiddleware(userController.updateUserAvatar),
// );

export default router;
