import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import {
  getConfirmationDetail,
  markConfirmed,
  markUnreachable,
  markSuspicious,
  scheduleRetry,
  cancelOrder,
} from "@/services/demo-orchestrator.service";
import { addEvent } from "@/services/operation-timeline.service";
import { transitionOrderStatus } from "@/services/order.service";
import { recordJourneyEvent } from "@/services/buyer-journey.service";
import { JOURNEY_EVENT_TYPES } from "@/types/journey";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) return new NextResponse("Forbidden", { status: 403 });

  const { orderId } = await params;
  const detail = await getConfirmationDetail(orgId, orderId);
  if (!detail) return new NextResponse("Not found", { status: 404 });

  return NextResponse.json(detail);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) return new NextResponse("Forbidden", { status: 403 });

  const { orderId } = await params;
  const body = await request.json();
  const { action, notes } = body;

  try {
    switch (action) {
      case "confirm":
        await markConfirmed(orgId, orderId, session.user.name ?? "operator", "manual_call", notes);
        break;
      case "unreachable":
        await markUnreachable(orgId, orderId, "manual_call", notes);
        break;
      case "suspicious":
        await markSuspicious(orgId, orderId, notes);
        break;
      case "retry":
        await scheduleRetry(orgId, orderId, notes);
        break;
      case "cancel":
        await cancelOrder(orgId, orderId, notes || "Cancelled by operator", session.user.name ?? "operator");
        break;
      case "delivered":
        await transitionOrderStatus(orgId, orderId, "DELIVERED");
        break;
      case "refused":
        await transitionOrderStatus(orgId, orderId, "REFUSED");
        break;
      case "buyer_replied":
        await addEvent(orgId, orderId, "buyer.responded", "buyer");
        await recordJourneyEvent(orgId, orderId, JOURNEY_EVENT_TYPES.BUYER_RESPONDED, { method: "manual" });
        break;
      case "delayed":
        await addEvent(orgId, orderId, "buyer.requested_delay", "buyer", { note: "Buyer requested delay" });
        await recordJourneyEvent(orgId, orderId, JOURNEY_EVENT_TYPES.BUYER_REQUESTED_DELAY, { operator: session.user.name });
        break;
      case "wrong_number":
        await addEvent(orgId, orderId, "operator.marked_unreachable", "operator", { note: "Wrong number reported" });
        break;
      case "operator_note":
        await addEvent(orgId, orderId, "operator.added_note", "operator", { note: notes ?? "No details" });
        break;
      case "ugc_request_sent":
        await addEvent(orgId, orderId, "ugc.requested", "operator", { note: notes ?? "Manual UGC request" });
        await recordJourneyEvent(orgId, orderId, JOURNEY_EVENT_TYPES.UGC_REQUEST_SENT, { operator: session.user.name });
        break;
      case "ugc_received":
        await addEvent(orgId, orderId, "ugc.received", "buyer", { note: notes ?? "UGC received from buyer" });
        await recordJourneyEvent(orgId, orderId, JOURNEY_EVENT_TYPES.UGC_RECEIVED, { operator: session.user.name });
        await transitionOrderStatus(orgId, orderId, "UGC_RECEIVED");
        break;
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
