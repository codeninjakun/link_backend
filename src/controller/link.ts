// given a link shorten it and redirect it to a new page
// put encrytion
import { ExpresRouteFn } from '../types/ExpressRoutefn';
import { AppError, globalErrorHandler } from '../middleware/errorMiddleware';
import prisma from '../db';

export const createLink: ExpresRouteFn = async (req, res, next) => {
  const { originalLink, shortLink, encState, encPass, qrCodeState } = req.body;

  // Shortlink must be unique
  try {
    const url = prisma.link.findFirstOrThrow({
      where: {
        shortLink: shortLink,
      },
    });
    res
      .status(404)
      .send({ message: 'Shortlink taken, use a different short-link!', url });
  } catch {
    // Shortlink is unique - Insert into db
    const createdLink = prisma.link.create({
      data: {
        shortLink: shortLink,
        originalLink: originalLink,
        encPass: encPass,
        encState: encState,
        // TODO: Add user type definitions
        //@ts-ignore
        belongsToId: user.id, // user login info,
        //@ts-ignore
        belongsToUser: user,
        qrCodeState: qrCodeState,
      },
    });

    res
      .status(207)
      .send({ message: 'Link created successfully!', createdLink });
  }
};
