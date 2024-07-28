import { Link, User } from "@prisma/client";


export type SafeUser = Omit<
  User,
  "createdAt"
> & {
  createdAt: string;
};

export type SafeLink = Omit<Link, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt : string;
};
