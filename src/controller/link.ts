// given a link shorten it and redirect it to a new page
// put encrytion
import { ExpresRouteFn } from "../types/ExpressRoutefn";
import { AppError, globalErrorHandler } from "../middleware/errorMiddleware";
import prisma from "../db";

export const createLink: ExpresRouteFn = async (req, res, next) => {
  const { originalLink, shortLink, encState, encPass, qrCodeState } = req.body;

  const url = await prisma.link.findUnique({
    where: {
      shortLink: shortLink,
    },
  });
  // Shortlink must be unique
  if (url) {
    res.status(404).send({
      message: "Shortlink taken, use a different short-link!",
      url,
    });
  }

  try {
    //@ts-ignore
    console.log(req.user);
    // @ts-ignore
    console.log(req.user.id);
    const createdLink = await prisma.link.create({
      data: {
        shortLink,
        originalLink,
        encState,
        encPass,
        // TODO: Add user type definitions
        //@ts-ignore
        //@ts-ignore
        belongsToId: req.user.id, // user login info
        // @ts-ignore
        qrCodeState,
      },
    });

    res
      .status(201)
      .send({ message: "Link created successfully!", createdLink });
  } catch (error: any) {
    // Shortlink is unique - Insert into db
    if (!(error instanceof AppError)) {
      error = new AppError(
        error.message || "Link creation failed. Please try again later.",
        500,
        false
      );
    }
    next(error);
  }
};
