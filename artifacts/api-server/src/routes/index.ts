import { Router, type IRouter } from "express";
import healthRouter from "./health";
import geminiRouter from "./gemini";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/gemini", geminiRouter);

export default router;
