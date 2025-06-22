import { Request, Response } from "express";
import ApiResponse from "../utils/ApiResponse";
import ApiError from "../utils/ApiError";

export const webhookVerify = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN;
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Meta webhook verified.");
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  } catch (error: any) {
    console.error("Error in webhookVerify:", error);
    return ApiError(error, res, "Failed to verify Meta webhook.", { function: "webhookVerify" });
  }
};

export const webhookFacebook = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    console.log("Facebook Webhook received:", JSON.stringify(req.body, null, 2));

    return ApiResponse(res, 200, "Facebook Webhook received successfully");
  } catch (error: any) {
    return ApiError(error, res, "Failed to receive Facebook webhook.", { function: "webhookFacebook" });
  }
};

export const webhookInstagram = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    console.log("Instagram Webhook received:", JSON.stringify(req.body, null, 2));

    return ApiResponse(res, 200, "Instagram Webhook received successfully");
  } catch (error: any) {
    return ApiError(error, res, "Failed to receive Instagram webhook.", { function: "webhookInstagram" });
  }
};
