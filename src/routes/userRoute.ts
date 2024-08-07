import express from 'express';
import asyncHandler from '../middleware/asyncHandler';
import { createNewUser, protect, signin } from '../controller/user';
import {
  createLink,
  getLink,
  removeLink,
  updateLink,
} from '../controller/link';

const router = express.Router();

router.post('/register', asyncHandler(createNewUser));
router.post('/login', asyncHandler(signin));
router.post('/newlink', protect, asyncHandler(createLink));
router.post('/removelink', protect, asyncHandler(removeLink));
router.get('/:short', asyncHandler(getLink));
router.post('/update/:short', protect, asyncHandler(updateLink));

export default router;
