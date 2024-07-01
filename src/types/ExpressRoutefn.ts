import { NextFunction, Request, Response } from "express";

export type ExpresRouteFn = (req : Request, res : Response, next : NextFunction) => Promise<any>;