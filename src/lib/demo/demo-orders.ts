import type { OrderStatus } from "@/types/order";
import type { ConfirmStatus } from "@/services/confirmation.service";

export const DEMO_FIRST_NAMES = [
  "Ahmed", "Mohamed", "Ali", "Youssef", "Karim", "Houssem", "Amine", "Sami",
  "Anis", "Walid", "Nader", "Skander", "Rami", "Khaled", "Firas", "Omar",
  "Fatma", "Mariem", "Nour", "Sarra", "Ikram", "Ines", "Asma", "Lina",
  "Yosra", "Hela", "Amira", "Sirine", "Rania", "Salma",
];

export const DEMO_LAST_NAMES = [
  "Ben Ali", "Trabelsi", "Mabrouk", "Haddad", "Khemiri", "Jaziri",
  "Ben Salah", "Mansouri", "Bouazizi", "Gharbi", "Mami", "Chaouch",
  "Bennour", "Ayari", "Cherni", "Dridi", "Slimane", "Ferjani",
  "Ben Ahmed", "Moussa", "Rtimi", "Bouaziz", "Zouari", "Nouri",
  "Laroussi", "Hajji", "Kacem", "Mejri", "Dhaouadi", "Khammassi",
];

export const DEMO_WILAYAS = [
  "Tunis", "Sfax", "Sousse", "Nabeul", "Bizerte", "Monastir",
  "Kairouan", "Gabès", "Mahdia", "Ariana", "Ben Arous", "Mannouba",
  "Kasserine", "Gafsa", "Medenine", "Tataouine", "Jendouba", "Béja",
  "Siliana", "Kébili", "Tozeur", "Zaghouan", "Le Kef",
];

export const DEMO_PRODUCTS = [
  "Parfum Importé 50ml", "Montre Connectée", "Casque Bluetooth",
  "Sac à Main Cuir", "Lunettes de Soleil", "Smartphone Samsung A25",
  "Tapis de Prière Luxe", "Décoration Murale", "Vêtement Premium",
  "Chaussures Sport", "Bijoux Fantaisie", "Produit Beauté Bio",
  "Électroménager", "Accessoire Auto", "Parfum Oud",
  "iPhone Chargeur", "Montre Sport", "Parfum Luxe",
  "Veste Cuir", "Crème Visage", "Shampoing Bio",
  "Sac à Dos", "Bougies Parfumées", "Thé Premium",
];

export const DEMO_DELIVERY_PROVIDERS = [
  "Aramex", "DHL", "UPS", "TNT", "FedEx",
  "Poste Tunisienne", "Chronopost",
];

export const DEMO_PHONE_PREFIXES = ["5", "2", "9", "4", "3"];

export function pickRandom<T>(arr: readonly T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

export function pickWeightedIndex(weights: number[], rand: () => number): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

export function generatePhone(rand: () => number): string {
  const prefix = pickRandom(DEMO_PHONE_PREFIXES, rand);
  let num = prefix;
  for (let i = 0; i < 7; i++) {
    num += Math.floor(rand() * 10);
  }
  return num;
}

export function generateAmount(rand: () => number): number {
  const buckets = [30, 50, 80, 120, 150, 200, 250, 300, 400, 500];
  const weights = [25, 20, 18, 15, 10, 5, 3, 2, 1, 1];
  const idx = pickWeightedIndex(weights, rand);
  const base = buckets[idx];
  const variance = Math.floor(rand() * 30) - 15;
  return Math.max(10, base + variance);
}

export function generateRiskScore(amount: number, rand: () => number): number {
  let score = rand() * 100;
  if (amount > 200) score += 10;
  if (amount > 350) score += 10;
  score = Math.max(0, Math.min(100, score));
  return Math.round(score);
}

export function generateStatus(riskScore: number, rand: () => number): OrderStatus {
  if (riskScore > 70) {
    return pickRandom(["CREATED", "PENDING_RESCHEDULE", "REFUSED"], rand);
  }
  if (riskScore > 40) {
    return pickRandom(
      ["CREATED", "PRE_SHIPPING_CONFIRM_SENT", "SHIPPED", "DELIVERED"],
      rand
    );
  }
  return pickRandom(
    ["BUYER_CONFIRMED", "SHIPPED", "DELIVERED", "UGC_REQUESTED", "UGC_RECEIVED"],
    rand
  );
}

export function generateConfirmStatus(status: OrderStatus, riskScore: number, rand: () => number): ConfirmStatus {
  if (status === "DELIVERED" || status === "UGC_REQUESTED" || status === "UGC_RECEIVED") {
    return "confirmed";
  }
  if (status === "BUYER_CONFIRMED") return "confirmed";
  if (status === "REFUSED" || status === "INTELLIGENT_CANCEL") return "cancelled";
  if (riskScore > 70) {
    return pickRandom(
      ["pending_confirmation", "contacted", "unreachable", "suspicious"],
      rand
    );
  }
  if (riskScore > 40) {
    return pickRandom(
      ["pending_confirmation", "contacted", "confirmed"],
      rand
    );
  }
  return "confirmed";
}
