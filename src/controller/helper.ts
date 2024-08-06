import { ExpresRouteFn } from '../types/ExpressRoutefn';
import { AppError } from '../middleware/errorMiddleware';
import prisma from '../db';

type linkDetails = {
  originalLink: String;
  shortLink: String;
  encState: boolean;
  encPass: String;
  timelimitState: boolean;
  timeLimit: Date;
  belongsToId?: undefined;
  qrCodeState: boolean;
};
const findUnique = async (data: string) => {
  const link = await prisma.link.findUnique({
    where: { shortLink: data },
    include: { stats: true },
  });
  return link;
};

const create = async (linkDetail: linkDetails) => {
  const link = await prisma.link.create({
    //@ts-ignore
    data: linkDetail,
  });
  return link;
};

export { findUnique, create };
