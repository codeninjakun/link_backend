import { Request, Response, NextFunction } from 'express';
import { ExpresRouteFn } from '../types/ExpressRoutefn';

const asyncHandler = (fn: ExpresRouteFn) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
// this function takes a function as a paramter to resolve a promise and catch the next function
// the paramter function "fn" also takes parameters of type req,res and next

export default asyncHandler;
