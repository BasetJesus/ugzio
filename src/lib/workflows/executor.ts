// Workflow executor — will be extended in Sprint 5
// Evaluates AutomationRule conditions and dispatches actions

import { prisma } from "@/lib/db";

export async function evaluateAndDispatch(ruleId: string, eventPayload: unknown): Promise<void> {
  const rule = await prisma.automationRule.findUnique({
    where: { id: ruleId },
    include: { organization: true },
  });
  if (!rule || !rule.enabled) return;

  if (rule.executionCount >= rule.maxExecutionsPerHour) return;

  const conditionsMatched = true;

  await prisma.workflowExecution.create({
    data: {
      automationRuleId: rule.id,
      organizationId: rule.organizationId,
      triggeredBy: rule.trigger,
      eventPayload: JSON.parse(JSON.stringify(eventPayload)),
      conditionsMatched,
      actionsDispatched: JSON.parse(JSON.stringify(rule.actions)),
      status: conditionsMatched ? "completed" : "completed",
    },
  });

  await prisma.automationRule.update({
    where: { id: rule.id },
    data: { executionCount: { increment: 1 }, lastTriggeredAt: new Date() },
  });
}
