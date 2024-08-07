// given a link shorten it and redirect it to a new page
// put encrytion
// once created a link cannot be deleted
// get the link
// get the link with enc
import { ExpresRouteFn } from '../types/ExpressRoutefn';
import { AppError } from '../middleware/errorMiddleware';
import prisma from '../db';
import { Prisma } from '@prisma/client';
import { create, findUnique } from './helper';

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

  const url = await findUnique(shortLink);
  //   Check if shortlink already in db - must be unique
  if (url) {
    throw new AppError('Shortlink taken, use a different short-link!', 403);
  }

  try {
    const createdLink = await create({
      shortLink,
      originalLink,
      encState,
      encPass,
      // TODO: Add user type definitions
      //@ts-ignore
      belongsToId: req.user.id,
      qrCodeState,
      timeLimit,
      timelimitState,
    });

    // Initialize visit statistics for the newly created link
    const stats = await prisma.stats.create({
      data: {
        visits: [{}],
        location: [],
        aggregateVisits: 0,
        browser: [],
        visitTime: [],
        linkid: createdLink.id,
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

export const updateLink: ExpresRouteFn = async (req, res, next) => {
  const {
    originalLink,
    encState,
    encPass,
    qrCodeState,
    timeLimit,
    timelimitState,
  } = req.body;
  const shortLink = req.params['short'];

  const url = await findUnique(shortLink);
  //   Check if shortlink already in db - must be unique
  if (url) {
    try {
      const createdLink = await prisma.link.update({
        where: {
          shortLink,
          //@ts-ignore
          belongsToId: req.user.id,
        },
        data: {
          originalLink,
          encState,
          encPass,
          // TODO: Add user type definitions
          //@ts-ignore

          qrCodeState,
          timeLimit,
          timelimitState,
        },
      });

      res
        .status(201)
        .send({ message: 'Link updated successfully!', createdLink });
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
  } else {
    throw new AppError('Link not found.', 404);
  }
};

export const removeLink: ExpresRouteFn = async (req, res, next) => {
  const { shortLink } = req.body;
  // @ts-ignore
  const belongsToId = req.user.id;

  // find the link and verify it belongs to the correct user:
  try {
    const link = await findUnique(shortLink);
    if (!link) {
      throw new AppError('Link not found', 404);
    }
    if (link.belongsToId !== belongsToId) {
      throw new AppError('Unauthorized to delete this link', 400);
    }
    // Remove associated link statistics:
    await prisma.stats.delete({
      where: {
        id: link.stats[0].id,
      },
    });

    // Remove the link record:
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
  try {
    // find the link
    const link = await findUnique(shortLink);

    if (!link) {
      throw new AppError('Link not found', 404);
    }

    // Update the link statistics for this visit 👇
    const today = new Date();
    if (link.stats.length != 0) {
      const visit = link.stats[0].visits;
      //@ts-ignore
      visit[today.toLocaleDateString()] = visit[today.toLocaleDateString()]
        ? //@ts-ignore
          (visit[today.toLocaleDateString()] += 1)
        : 1;
      link.stats[0].browser.push(req.headers['user-agent']!);
      link.stats[0].location.push(req.headers.host!);
      link.stats[0].visitTime.push(today);
      const stats = await prisma.stats.update({
        where: {
          id: link.stats[0].id,
        },
        data: {
          aggregateVisits: (link.stats[0].aggregateVisits += 1),
          browser: link.stats[0].browser,
          location: link.stats[0].location,
          visits: visit as Prisma.InputJsonArray[],
          visitTime: link.stats[0].visitTime,
        },
      });
    }

    // Update the link statistics for this visit 👆

    // Check for TTL on the link
    if (link.timelimitState) {
      if (link.timeLimit && today >= link.timeLimit) {
        // IF TTL expired delete the link
        await prisma.link.delete({ where: { shortLink } });
        res.status(200).send('Link Expired');
      }
      // res.redirect(link.originalLink);
      // return;
    }
    res.redirect(link.originalLink);
  } catch (error: any) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        status: 'fail',
        message: error.message,
        code: error.statusCode,
      });
    }
    next(error);
  }
};
