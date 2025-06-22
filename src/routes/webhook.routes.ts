import { Router } from "express";
import { webhookVerify, webhookFacebook, webhookInstagram } from "../controllers/webhook.controller.js";

const router = Router();

router.get("/facebook", webhookVerify);
router.post("/facebook", webhookFacebook);

router.get("/instagram", webhookVerify);
router.post("/instagram", webhookInstagram);

export default router;
