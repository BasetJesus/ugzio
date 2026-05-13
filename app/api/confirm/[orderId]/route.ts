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
} from "@/services/confirmation.service";

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
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
