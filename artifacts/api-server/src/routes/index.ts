import { Router, type IRouter } from "express";
import healthRouter from "./health";
import accountsRouter from "./accounts";
import blogRouter from "./blog";
import adminRouter from "./admin";
import whatsappTrackingRouter from "./whatsappTracking";
import adminWhatsAppRouter from "./adminWhatsApp";

const router: IRouter = Router();

router.use(healthRouter);
router.use(accountsRouter);
router.use(blogRouter);
router.use(adminRouter);
router.use(whatsappTrackingRouter);
router.use(adminWhatsAppRouter);

export default router;
