import { Router } from "express";
import { createDispute, getDisputes } from "../controllers/disputeController";

const router = Router();

router.get("/", getDisputes);
router.post("/", createDispute);

export { router as disputeRouter };
