import { describe, it, expect } from "vitest";
import { derivePhase } from "@/services/buyer-order.service";

describe("Buyer Order Phase Derivation", () => {
  it("returns pre_confirmation for CREATED", () => {
    expect(derivePhase("CREATED")).toBe("pre_confirmation");
  });

  it("returns pre_confirmation for PRE_SHIPPING_CONFIRM_SENT", () => {
    expect(derivePhase("PRE_SHIPPING_CONFIRM_SENT")).toBe("pre_confirmation");
  });

  it("returns pre_confirmation for PENDING_RESCHEDULE", () => {
    expect(derivePhase("PENDING_RESCHEDULE")).toBe("pre_confirmation");
  });

  it("returns confirmed for BUYER_CONFIRMED", () => {
    expect(derivePhase("BUYER_CONFIRMED")).toBe("confirmed");
  });

  it("returns shipped for SHIPPED", () => {
    expect(derivePhase("SHIPPED")).toBe("shipped");
  });

  it("returns delivered for DELIVERED", () => {
    expect(derivePhase("DELIVERED")).toBe("delivered");
  });

  it("returns completed for UGC_REQUESTED", () => {
    expect(derivePhase("UGC_REQUESTED")).toBe("completed");
  });

  it("returns completed for UGC_RECEIVED", () => {
    expect(derivePhase("UGC_RECEIVED")).toBe("completed");
  });

  it("returns pre_confirmation for unknown statuses", () => {
    expect(derivePhase("INTELLIGENT_CANCEL")).toBe("pre_confirmation");
    expect(derivePhase("REFUSED")).toBe("pre_confirmation");
    expect(derivePhase("")).toBe("pre_confirmation");
  });
});

describe("Buyer Order Service (integration)", () => {
  it("getBuyerOrder returns null for non-existent order", async () => {
    const { getBuyerOrder } = await import("@/services/buyer-order.service");
    const result = await getBuyerOrder("nonexistent-id");
    expect(result).toBeNull();
  });

  it("buyerConfirmOrder returns false for non-existent order", async () => {
    const { buyerConfirmOrder } = await import("@/services/buyer-order.service");
    const result = await buyerConfirmOrder("nonexistent-id", "confirm");
    expect(result.success).toBe(false);
  });

  it("submitBuyerFeedback returns false for non-existent order", async () => {
    const { submitBuyerFeedback } = await import("@/services/buyer-order.service");
    const result = await submitBuyerFeedback("nonexistent-id", 5);
    expect(result.success).toBe(false);
  });
});
