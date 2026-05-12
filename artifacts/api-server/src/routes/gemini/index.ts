import { Router } from "express";
import conversationsRouter from "./conversations";
import studyRouter from "./study";
import pdfRouter from "./pdf";

const router = Router();

router.use(conversationsRouter);
router.use(studyRouter);
router.use(pdfRouter);

export default router;
