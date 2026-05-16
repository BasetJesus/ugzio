import { prisma } from "@/lib/db";
import { safeNumber, safeString } from "@/lib/core/safe-render";
import { createOrder } from "@/services/order.service";
import { emit } from "@/lib/events/event-bus";
import { EventType } from "@/lib/events/taxonomy";

export interface ImportRow {
  customerName: string;
  phone: string;
  amount: number;
  city: string;
  product: string;
  deliveryProvider: string;
}

export interface ImportValidationError {
  row: number;
  field: string;
  message: string;
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  failedCount: number;
  errors: ImportValidationError[];
  orderIds: string[];
}

export const REQUIRED_COLUMNS = [
  "customerName",
  "phone",
  "amount",
  "city",
  "product",
  "deliveryProvider",
] as const;

const COLUMN_VARIANTS: Record<string, string[]> = {
  customerName: ["customerName", "customername", "customer_name", "name", "buyerName", "buyername", "buyer_name"],
  phone: ["phone", "phoneNumber", "phonenumber", "phone_number", "telephone", "mobile"],
  amount: ["amount", "price", "total", "orderAmount", "orderamount", "order_amount"],
  city: ["city", "wilaya", "town", "location", "buyerWilaya", "buyerwilaya", "buyer_wilaya"],
  product: ["product", "item", "productName", "productname", "product_name"],
  deliveryProvider: ["deliveryProvider", "deliveryprovider", "delivery_provider", "provider", "carrier", "shipping"],
};

function normalizeColumnName(col: string): string {
  const trimmed = col.trim();
  for (const [standard, variants] of Object.entries(COLUMN_VARIANTS)) {
    if (variants.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
      return standard;
    }
  }
  return trimmed;
}

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headerLine = lines[0];
  const headers = parseCSVRow(headerLine).map(normalizeColumnName);

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVRow(lines[i]);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] ?? "";
    }
    rows.push(row);
  }

  return rows;
}

function parseCSVRow(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
  }
  result.push(current.trim());
  return result;
}

function validateRow(raw: Record<string, string>, rowIndex: number): { valid: boolean; data?: ImportRow; errors: ImportValidationError[] } {
  const errors: ImportValidationError[] = [];
  const rowNum = rowIndex + 2;

  const customerName = safeString(raw.customerName, "").trim();
  if (!customerName) {
    errors.push({ row: rowNum, field: "customerName", message: "Customer name is required" });
  }

  const phone = safeString(raw.phone, "").trim();
  if (!phone) {
    errors.push({ row: rowNum, field: "phone", message: "Phone number is required" });
  }

  const amountRaw = safeString(raw.amount, "0").trim();
  const amount = safeNumber(parseFloat(amountRaw), 0);
  if (amount <= 0) {
    errors.push({ row: rowNum, field: "amount", message: "Amount must be greater than 0" });
  }

  const city = safeString(raw.city, "").trim();
  if (!city) {
    errors.push({ row: rowNum, field: "city", message: "City is required" });
  }

  const product = safeString(raw.product, "").trim();
  if (!product) {
    errors.push({ row: rowNum, field: "product", message: "Product is required" });
  }

  const deliveryProvider = safeString(raw.deliveryProvider, "").trim();

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: { customerName, phone, amount, city, product, deliveryProvider },
  };
}

export async function validateCSV(content: string): Promise<{ valid: boolean; rowCount: number; errors: ImportValidationError[]; columns: string[] }> {
  try {
    const rows = parseCSV(content);
    if (rows.length === 0) {
      return { valid: false, rowCount: 0, errors: [{ row: 0, field: "file", message: "No data rows found in CSV" }], columns: [] };
    }

    const firstRow = rows[0];
    const foundColumns: string[] = [];
    const missingColumns: string[] = [];

    for (const col of REQUIRED_COLUMNS) {
      if (firstRow[col] !== undefined) {
        foundColumns.push(col);
      } else {
        missingColumns.push(col);
      }
    }

    if (missingColumns.length > 0) {
      return {
        valid: false,
        rowCount: rows.length,
        columns: Object.keys(firstRow),
        errors: [{ row: 1, field: "header", message: `Missing columns: ${missingColumns.join(", ")}. Required: ${REQUIRED_COLUMNS.join(", ")}` }],
      };
    }

    const allErrors: ImportValidationError[] = [];
    for (let i = 0; i < rows.length; i++) {
      const result = validateRow(rows[i], i);
      allErrors.push(...result.errors);
    }

    return {
      valid: allErrors.length === 0,
      rowCount: rows.length,
      columns: Object.keys(firstRow),
      errors: allErrors,
    };
  } catch {
    return { valid: false, rowCount: 0, columns: [], errors: [{ row: 0, field: "file", message: "Failed to parse CSV file" }] };
  }
}

export async function importOrdersFromCSV(
  orgId: string,
  content: string
): Promise<ImportResult> {
  try {
    const validation = await validateCSV(content);
    if (!validation.valid) {
      return {
        success: false,
        importedCount: 0,
        failedCount: validation.rowCount,
        errors: validation.errors,
        orderIds: [],
      };
    }

    const rows = parseCSV(content);
    const orderIds: string[] = [];
    const errors: ImportValidationError[] = [];

    for (let i = 0; i < rows.length; i++) {
      const validationResult = validateRow(rows[i], i);
      if (!validationResult.valid || !validationResult.data) {
        errors.push(...validationResult.errors);
        continue;
      }

      const data = validationResult.data;

      try {
        const providerId = await getOrCreateProvider(orgId, data.deliveryProvider);

        const order = await createOrder(orgId, {
          buyerName: data.customerName,
          buyerPhone: data.phone,
          product: data.product,
          amount: data.amount,
          buyerWilaya: data.city,
        });

        if (providerId && order) {
          await prisma.order.update({
            where: { id: order.id },
            data: { deliveryProviderId: providerId },
          });
        }

        if (order) {
          orderIds.push(order.id);
        }
      } catch (e) {
        errors.push({
          row: i + 2,
          field: "create",
          message: `Failed to create order: ${e instanceof Error ? e.message : "Unknown error"}`,
        });
      }
    }

    emit(EventType.ORDER_BATCH_IMPORTED, {
      orgId,
      count: orderIds.length,
      orderIds,
    });

    return {
      success: errors.length === 0,
      importedCount: orderIds.length,
      failedCount: errors.length,
      errors,
      orderIds,
    };
  } catch {
    return {
      success: false,
      importedCount: 0,
      failedCount: 0,
      errors: [{ row: 0, field: "system", message: "Import failed" }],
      orderIds: [],
    };
  }
}

async function getOrCreateProvider(orgId: string, name: string): Promise<string | null> {
  if (!name.trim()) return null;

  try {
    const existing = await prisma.deliveryProvider.findFirst({
      where: { organizationId: orgId, name: name.trim() },
    });

    if (existing) return existing.id;

    const count = await prisma.deliveryProvider.count({ where: { organizationId: orgId } });

    const provider = await prisma.deliveryProvider.create({
      data: {
        organizationId: orgId,
        name: name.trim(),
        isDefault: count === 0,
      },
    });

    return provider.id;
  } catch {
    return null;
  }
}
