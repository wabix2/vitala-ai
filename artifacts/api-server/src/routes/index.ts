import { Router, type IRouter } from "express";
import healthRouter from "./health";
import chatRouter from "./chat";
import leaderboardRouter from "./leaderboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(chatRouter);
router.use(leaderboardRouter);

export default router;
