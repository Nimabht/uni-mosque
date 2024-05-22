import express, { Router } from "express";
import asyncMiddleware from "../middlewares/async";
import jwtValidator from "../middlewares/auth/jwtValidator";
import hasAccessByRole from "../middlewares/auth/hasAccessByRole";
import getAvailableTime from "../middlewares/availableTime/getAvailableTime";
import reservationController from "./../controllers/reservation";
import getReservation from "../middlewares/reservation/getReservation";

const router: Router = express.Router();

router.param("availableTimeId", getReservation);

router.get(
  "",
  [jwtValidator, hasAccessByRole(["Admin"])],
  asyncMiddleware(reservationController.getAllReservations),
);

router.get(
  "/:reservationId",
  [jwtValidator, hasAccessByRole(["Admin", "User"])],
  asyncMiddleware(reservationController.getReservationById),
);

// router.post(
//   "",
//   [jwtValidator, hasAccessByRole(["Admin"])],
//   asyncMiddleware(availableTimeController.createAvailableTime),
// );

// router.delete(
//   "/:availableTimeId",
//   [jwtValidator, hasAccessByRole(["Admin"])],
//   asyncMiddleware(availableTimeController.deleteAvailableTime),
// );

export default router;
