import { z } from "zod";

export const phoneSchema = z.string().min(8).max(20);

export const amountSchema = z.number().positive().finite();

export const createOrderSchema = z.object({
  buyerName: z.string().min(1).max(200),
  buyerPhone: phoneSchema,
  product: z.string().max(200).optional(),
  amount: amountSchema,
  buyerWilaya: z.string().max(100).optional(),
});

export const registerSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(255),
  password: z.string().min(6).max(128),
});

export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(128),
});

export const waitlistSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(255),
  phone: phoneSchema.optional(),
  niche: z.string().max(200).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "CREATED", "PRE_SHIPPING_CONFIRM_SENT", "BUYER_CONFIRMED",
    "SHIPPED", "DELIVERED", "UGC_REQUESTED", "UGC_RECEIVED",
    "INTELLIGENT_CANCEL", "PENDING_RESCHEDULE", "REFUSED",
  ]),
});

export const confirmActionSchema = z.object({
  action: z.enum([
    "confirm", "cancel", "retry", "unreachable", "suspicious",
    "delivered", "refused", "buyer_replied", "delayed",
    "wrong_number", "operator_note",
    "ugc_request_sent", "ugc_received",
  ]),
  notes: z.string().max(500).optional(),
});

export const riskScoreSchema = z.object({
  phone: phoneSchema,
  excludeOrderId: z.string().optional(),
});

export const blacklistActionSchema = z.object({
  phone: phoneSchema,
  reason: z.string().max(500).optional(),
});

export const ugcActionSchema = z.object({
  action: z.enum(["approve", "reject"]),
  notes: z.string().max(500).optional(),
});

export const deliveryProviderSchema = z.object({
  name: z.string().min(1).max(200),
  rtsCostPerFailure: z.number().nonnegative().finite(),
  avgDeliveryDays: z.number().int().nonnegative().finite(),
  contactSuccessRate: z.number().min(0).max(100).optional(),
});

export const ugcTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  body: z.string().min(1).max(2000),
  language: z.enum(["ar", "fr", "en"]).optional(),
});

export const conversationNoteSchema = z.object({
  content: z.string().min(1).max(2000),
});

export const buyerConfirmSchema = z.object({
  token: z.string().min(1),
  orderId: z.string().min(1),
  action: z.enum(["confirm", "question"]).optional(),
});

export const buyerFeedbackSchema = z.object({
  token: z.string().min(1),
  orderId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const buyerReferralSchema = z.object({
  code: z.string().min(1).max(100),
  phone: phoneSchema,
});

export const generateCaptionSchema = z.object({
  topic: z.string().min(1).max(500),
  tone: z.enum(["calm", "funny", "inspirational", "strong"]).optional(),
  platform: z.enum(["tiktok", "instagram", "facebook"]).optional(),
  price: z.string().max(50).optional(),
  link: z.string().url().max(500).optional(),
  brand: z.object({
    niche: z.string().max(200).optional(),
    audience: z.string().max(200).optional(),
    brandTone: z.enum(["funny_close", "elegant_refined", "direct_clear"]).optional(),
    usp: z.string().max(500).optional(),
  }).optional(),
});

export const onboardingSchema = z.object({
  shopName: z.string().min(1).max(200),
  sellerPhone: phoneSchema.optional(),
});

export function formatZodErrors(error: z.ZodError): string {
  return error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
}
