import { Router, type IRouter } from "express";
import healthRouter from "./health";
import matchdayRouter from "./matchday";

const router: IRouter = Router();

router.use(healthRouter);
router.use(matchdayRouter);

export default router;
