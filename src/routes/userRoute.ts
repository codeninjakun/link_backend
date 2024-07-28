import express from "express";
import asyncHandler from "../middleware/asyncHandler";
import { createNewUser, protect, signin } from "../controller/user";
import { createLink } from "../controller/link";

const router  = express.Router();

router.post("/register", asyncHandler(createNewUser));
router.post("/login",asyncHandler(signin));
router.post("/newlink", protect,asyncHandler(createLink));

export default router;