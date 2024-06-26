import prisma from '../db';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';

export const createNewUser = async (req: Request, res: Response) => {
  const user = await prisma.user.create({
    // TODO: username!!! - please add in schema and migrate @sahil!
    data: {
      email: req.body.email,
      passwordHash: await hashPassword(req.body.password),
    },
  });
  // TODO: token generation - @rutuj
  res.json({ user });
};

export const signin = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: {
      email: req.body.email,
    },
  });

  //@ts-ignore [TODO: create user interface in .d.ts file] - @rutuj
  const isValid = await comparePasswords(req.body.password, user.password);
  //@ts-ignore
  if (!isValid) {
    res.status(401);
    res.json({ message: 'nope' });
    return;
  }

  // TODO: token generation - @sahil
  res.json({ user });
};

function hashPassword(password: any): string {
  //@ts-ignore
  return bcrypt.hash(password, parseInt(process.env.SALT));
}

function comparePasswords(password: any, hash: any) {
  return bcrypt.compare(password, hash);
}
