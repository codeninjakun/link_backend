import prisma from "../db";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import asyncHandler from "../middleware/asyncHandler";
import { ExpresRouteFn } from "../types/ExpressRoutefn";
import { AppError, globalErrorHandler } from "../middleware/errorMiddleware";

// export const createNewUser = async (req: Request, res: Response) => {
//   const user = await prisma.user.create({
//     // TODO: username!!! - please add in schema and migrate @sahil!
//     data: {
//       name : req.body.name,
//       email: req.body.email,
//       passwordHash: await hashPassword(req.body.password),
//     },
//   });
//   // TODO: token generation - @rutuj
//   res.json({ user });
// };

export const createNewUser: ExpresRouteFn = async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new AppError("Please provide all the required details", 500));
  }

  try {
    const oldUser = await prisma.user.findUnique({ where: { email } });

    if (oldUser) {
      return next(
        globalErrorHandler(
          new AppError("User already registered", 502),
          req,
          res,
          next
        )
      );
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
      },
    });

    res.status(200).json({
      message: "User created",
      newUser,
    });
  } catch (error: any) {
    if (!(error instanceof AppError)) {
      error = new AppError(
        error.message || "User creation failed. Please try again later.",
        500,
        false
      );
    }
    next(error);
  }
};

export const signin: ExpresRouteFn = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide all the required details", 500));
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    //@ts-ignore [TODO: create user interface in .d.ts file] - @rutuj
    const isValid = await comparePasswords(req.body.password, user.password);
    if (!isValid) {
      res.status(401).json({
        message: "Invalid password",
      });
    }

    res.status(200).json({
      message: "User logged in successfully",
      user,
    });
  } catch (error: any) {
    if (!(error instanceof AppError)) {
      error = new AppError(
        error.message || "User creation failed. Please try again later.",
        500,
        false
      );
    }
    next(error);
  }
};

function hashPassword(password: any): string {
  //@ts-ignore
  return bcrypt.hash(password, parseInt(process.env.SALT));
}

function comparePasswords(password: any, hash: any) {
  return bcrypt.compare(password, hash);
}
