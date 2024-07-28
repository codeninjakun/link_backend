import prisma from "../db";
import bcrypt from "bcrypt";
import { ExpresRouteFn } from "../types/ExpressRoutefn";
import { AppError, globalErrorHandler } from "../middleware/errorMiddleware";
import jwt from "jsonwebtoken";

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
    const token = createJWT(newUser);
    res.status(200).json({ token });
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
    const isValid = await comparePasswords(
      req.body.password,
      user?.passwordHash
    );
    console.log(isValid);
    if (!isValid) {
      res.status(401).json({
        message: "Invalid password",
      });
    }

    const token = createJWT(user);
    res.json({ token });
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

export const createJWT = (user: any) => {
  const token = jwt.sign(
    user,
    //@ts-ignore
    process.env.JWT_SECRET
  );
  return token;
};

export const protect: ExpresRouteFn = async (req, res, next) => {
  const bearer = req.headers.authorization;

  if (!bearer) {
    res.status(401);
    res.json({ message: "not authorized" });
    return;
  }

  const [, token] = bearer.split(" ");

  if (!token) {
    res.status(401);
    res.json({ message: "not valid token" });
    return;
  }

  try {
    //@ts-ignore
    const user = jwt.verify(token, process.env.JWT_SECRET);
    //@ts-ignore
    req.user = user;
    next();
  } catch (e) {
    console.error(e);
    res.status(401);
    res.json({ message: "not valid token" });
    return;
  }
};
