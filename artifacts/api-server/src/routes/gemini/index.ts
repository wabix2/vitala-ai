import { Router } from "express";
import conversationsRouter from "./conversations";
import studyRouter from "./study";
import pdfRouter from "./pdf";
import feynmanRouter from "./feynman";
const router = Router();

router.use(conversationsRouter);
router.use(studyRouter);
router.use(pdfRouter);

export default router;
router.use(feynmanRouter);
