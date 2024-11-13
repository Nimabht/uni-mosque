import express, { Router } from "express";
import asyncMiddleware from "../middlewares/async";
import jwtValidator from "../middlewares/auth/jwtValidator";
import hasAccessByRole from "../middlewares/auth/hasAccessByRole";
import blogController from "../controllers/blog";
import { uploadThumbnail } from "../utils/multerConfig";
import hasAccessByAdminOrBlogOwner from "../middlewares/blog/hasAccessByAdminOrBlogOwner";

const router: Router = express.Router();

router.get("/", asyncMiddleware(blogController.getAllBlogs));

router.get("/newest", asyncMiddleware(blogController.getNewestBlogs));

router.get("/:blogId", asyncMiddleware(blogController.getBlogById));

router.get(
  "/thumbnail/:blogId",
  asyncMiddleware(blogController.getBlogThumbnailById),
);

router.post(
  "/",
  [jwtValidator, hasAccessByRole(["Admin", "Blogger"]), uploadThumbnail],
  asyncMiddleware(blogController.createBlog),
);

router.put(
  "/:blogId",
  [jwtValidator, hasAccessByAdminOrBlogOwner],
  asyncMiddleware(blogController.updateBlog),
);

router.delete(
  "/:blogId",
  [jwtValidator, hasAccessByAdminOrBlogOwner],
  asyncMiddleware(blogController.deleteBlog),
);

router.patch(
  "/upload-thumbnail/:blogId",
  [jwtValidator, hasAccessByAdminOrBlogOwner, uploadThumbnail],
  asyncMiddleware(blogController.uploadThumbnail),
);

router.delete(
  "/remove-thumbnail/:blogId",
  [jwtValidator, hasAccessByAdminOrBlogOwner],
  asyncMiddleware(blogController.removeThumbnail),
);

export default router;
