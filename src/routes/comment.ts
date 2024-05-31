import express, { Router } from "express";
import asyncMiddleware from "../middlewares/async";
import hasAccessByRole from "../middlewares/auth/hasAccessByRole";
import jwtValidator from "../middlewares/auth/jwtValidator";
import getCommnet from "../middlewares/comment/getCommnet";
import commentsController from "../controllers/comment";

const router: Router = express.Router();

router.param("commentId", getCommnet);

router.get(
  "",
  [jwtValidator, hasAccessByRole(["admin"])],
  asyncMiddleware(commentsController.getAllComments),
);

router.get(
  "/:commentable_type/:commentable_id",
  asyncMiddleware(commentsController.getAllCommentsByTypeAndId),
);

router.get("/:commentId", asyncMiddleware(commentsController.getCommentById));

router.patch(
  "/showStatus",
  [jwtValidator, hasAccessByRole(["admin"])],
  asyncMiddleware(commentsController.updateCommentShowStatus),
);

router.post("", asyncMiddleware(commentsController.createComment));

router.delete(
  "/:commentId",
  [jwtValidator, hasAccessByRole(["admin"])],
  asyncMiddleware(commentsController.deleteComment),
);

export default router;
