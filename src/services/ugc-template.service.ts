import { prisma } from "@/lib/db"

export interface UgcTemplateSummary {
  id: string
  organizationId: string
  name: string
  requestType: string
  messageBody: string
  incentive: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UgcTemplateCreate {
  name: string
  requestType: string
  messageBody: string
  incentive?: string
  isActive?: boolean
}

export interface UgcTemplateUpdate {
  name?: string
  requestType?: string
  messageBody?: string
  incentive?: string
  isActive?: boolean
}

export interface TemplateVariables {
  buyerName: string
  product?: string
  orderAmount?: string
  incentive?: string
}

function formatTemplate(t: {
  id: string
  organizationId: string
  name: string
  requestType: string
  messageBody: string
  incentive: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}): UgcTemplateSummary {
  return {
    id: t.id,
    organizationId: t.organizationId,
    name: t.name,
    requestType: t.requestType,
    messageBody: t.messageBody,
    incentive: t.incentive,
    isActive: t.isActive,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }
}

export async function getTemplates(orgId: string): Promise<UgcTemplateSummary[]> {
  try {
    const templates = await prisma.ugcRequestTemplate.findMany({
      where: { organizationId: orgId },
      orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
    })
    return templates.map(formatTemplate)
  } catch {
    return []
  }
}

export async function getTemplate(orgId: string, templateId: string): Promise<UgcTemplateSummary | null> {
  try {
    const t = await prisma.ugcRequestTemplate.findFirst({
      where: { id: templateId, organizationId: orgId },
    })
    if (!t) return null
    return formatTemplate(t)
  } catch {
    return null
  }
}

export async function getDefaultTemplate(orgId: string): Promise<UgcTemplateSummary | null> {
  try {
    const t = await prisma.ugcRequestTemplate.findFirst({
      where: { organizationId: orgId, isActive: true },
      orderBy: { createdAt: "asc" },
    })
    if (!t) return null
    return formatTemplate(t)
  } catch {
    return null
  }
}

export async function createTemplate(
  orgId: string,
  data: UgcTemplateCreate,
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const name = data.name.trim()
    if (!name) {
      return { success: false, error: "Template name is required" }
    }
    if (!data.requestType) {
      return { success: false, error: "Request type is required" }
    }
    if (!data.messageBody.trim()) {
      return { success: false, error: "Message body is required" }
    }

    const t = await prisma.ugcRequestTemplate.create({
      data: {
        organizationId: orgId,
        name,
        requestType: data.requestType,
        messageBody: data.messageBody,
        incentive: data.incentive ?? "",
        isActive: data.isActive ?? true,
      },
    })

    return { success: true, id: t.id }
  } catch {
    return { success: false, error: "Failed to create template" }
  }
}

export async function updateTemplate(
  orgId: string,
  templateId: string,
  data: UgcTemplateUpdate,
): Promise<{ success: boolean; error?: string }> {
  try {
    const existing = await prisma.ugcRequestTemplate.findFirst({
      where: { id: templateId, organizationId: orgId },
    })
    if (!existing) {
      return { success: false, error: "Template not found" }
    }

    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name.trim()
    if (data.requestType !== undefined) updateData.requestType = data.requestType
    if (data.messageBody !== undefined) updateData.messageBody = data.messageBody
    if (data.incentive !== undefined) updateData.incentive = data.incentive
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    await prisma.ugcRequestTemplate.update({
      where: { id: templateId },
      data: updateData,
    })

    return { success: true }
  } catch {
    return { success: false, error: "Failed to update template" }
  }
}

export async function deleteTemplate(
  orgId: string,
  templateId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const existing = await prisma.ugcRequestTemplate.findFirst({
      where: { id: templateId, organizationId: orgId },
    })
    if (!existing) {
      return { success: false, error: "Template not found" }
    }

    await prisma.ugcRequestTemplate.delete({
      where: { id: templateId },
    })

    return { success: true }
  } catch {
    return { success: false, error: "Failed to delete template" }
  }
}

export function renderTemplate(
  messageBody: string,
  vars: TemplateVariables,
): string {
  return messageBody
    .replace(/\{\{buyerName\}\}/g, vars.buyerName)
    .replace(/\{\{product\}\}/g, vars.product ?? "commande")
    .replace(/\{\{orderAmount\}\}/g, vars.orderAmount ?? "")
    .replace(/\{\{incentive\}\}/g, vars.incentive ?? "")
}
