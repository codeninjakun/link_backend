// given a link shorten it and redirect it to a new page
// put encrytion
// once created a link cannot be deleted
// get the link
// get the link with enc
import { ExpresRouteFn } from '../types/ExpressRoutefn';
import { AppError, globalErrorHandler } from '../middleware/errorMiddleware';
import prisma from '../db';

export const createLink: ExpresRouteFn = async (req, res, next) => {
  const {
    originalLink,
    shortLink,
    encState,
    encPass,
    qrCodeState,
    timeLimit,
    timelimitState,
  } = req.body;

  const url = await prisma.link.findUnique({
    where: {
      shortLink: shortLink,
    },
  });
  //   Check if shortlink already in db - must be unique
  if (url) {
    throw new AppError('Shortlink taken, use a different short-link!', 403);
  }

  try {
    const createdLink = await prisma.link.create({
      data: {
        shortLink,
        originalLink,
        encState,
        encPass,
        // TODO: Add user type definitions
        //@ts-ignore
        belongsToId: req.user.id, // user login info
        // @ts-ignore
        qrCodeState,
        timeLimit,
        timelimitState,
      },
    });

    res
      .status(201)
      .send({ message: 'Link created successfully!', createdLink });
  } catch (error: any) {
    // Shortlink is unique - Insert into db
    if (error.statusCode === 404) {
      return res.status(404).json({
        status: 'fail',
        message: error.message,
        code: error.statusCode,
      });
    }
    next(error); // Pass other errors to the global error handler
  }
};

export const removeLink: ExpresRouteFn = async (req, res, next) => {
  const { shortLink } = req.body;
  // @ts-ignore
  const belongsToId = req.user.id;

  // find the link from id
  try {
    const link = await prisma.link.findUnique({ where: { shortLink } });
    if (!link) {
      throw new AppError('Link not found', 404);
    }
    if (link.belongsToId !== belongsToId) {
      throw new AppError('Unauthorized to delete this link', 400);
    }
    await prisma.link.delete({
      where: {
        shortLink,
      },
    });
    res.status(200).send({
      message: 'Link removed!',
    });
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(405).json({
        status: 'fail',
        message: error.message,
        code: error.statusCode,
      });
    }
    next(error); // Pass other errors to the global error handler
  }
};

// get a single link of that user and TODO: add enc method to open that link with password only
export const getLink: ExpresRouteFn = async (req, res, next) => {
  const shortLink = req.params['short'];
  console.log(shortLink);
  try {
    // find the link
    const link = await prisma.link.findUnique({ where: { shortLink } });
    if (!link) {
      throw new AppError('Link not found', 404);
    }
    // delete the short link record after given time stamp
    if (link.timelimitState) {
      const nowTime = new Date();
      if (link.timeLimit && nowTime >= link.timeLimit) {
        await prisma.link.delete({ where: { shortLink } });
        res.status(200).send('Link Expired');
      }
      if (link.encState) {
        res.redirect('./encCheck.html');
        return;
      }
      res.redirect(link.originalLink);
      return;
    }
    if (link.encState) {
      res.redirect('./encCheck.html');
      return;
    }
    res.redirect(link.originalLink);
    // res.status(200).send({ message: "Link found!", Link : link.originalLink });
  } catch (error: any) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        status: 'fail',
        message: error.message,
        code: error.statusCode,
      });
    }
    next(error); // Pass other errors to the global error handler
  }
};
