import { Router, type IRouter } from "express";
import healthRouter from "./health";
import swapRouter from "./swap";

const router: IRouter = Router();

router.use(healthRouter);
router.use(swapRouter);

export default router;
