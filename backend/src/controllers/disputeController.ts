import { Request, Response } from "express";

export const getDisputes = (_req: Request, res: Response) => {
  // Placeholder: return empty list
  res.json({ disputes: [] });
};

export const createDispute = (req: Request, res: Response) => {
  // Placeholder: echo received payload
  res.status(201).json({ data: req.body });
};
