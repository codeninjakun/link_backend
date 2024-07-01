import express from "express";
import asyncHandler from "../middleware/asyncHandler";
import { createNewUser, signin } from "../controller/user";

const router  = express.Router();

router.post("/register", asyncHandler(createNewUser));
router.post("/login",asyncHandler(signin))

export default router;