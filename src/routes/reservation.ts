import express, { Router } from "express";
import asyncMiddleware from "../middlewares/async";
import jwtValidator from "../middlewares/auth/jwtValidator";
import hasAccessByRole from "../middlewares/auth/hasAccessByRole";
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
  "/my",
  [jwtValidator, hasAccessByRole(["Admin", "User"])],
  asyncMiddleware(reservationController.getAllReservationsForUser),
);

router.get(
  "/:reservationId",
  [jwtValidator, hasAccessByRole(["Admin", "User"])],
  asyncMiddleware(reservationController.getReservationById),
);

router.post(
  "/:availableTimeId/make",
  [jwtValidator, hasAccessByRole(["Admin", "User"])],
  asyncMiddleware(reservationController.makeReservation),
);

router.delete(
  "/:reservationId/undo",
  [jwtValidator, hasAccessByRole(["Admin", "User"])],
  asyncMiddleware(reservationController.undoReservation),
);

// router.post(
//   ":availableTimeId",
//   [jwtValidator, hasAccessByRole(["Admin", "User"])],
//   asyncMiddleware(reservationController.makeReservation),
// );

// router.delete(
//   "/:availableTimeId",
//   [jwtValidator, hasAccessByRole(["Admin"])],
//   asyncMiddleware(availableTimeController.deleteAvailableTime),
// );

export default router;
