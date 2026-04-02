export interface PendingStkPayment {
  donationId: string;
  amount: string;
  phone: string;
  currency: string;
  createdAt: number;
  transactionId?: string | null;
  transactionRequestId?: string | null;
}

const STORAGE_KEY = "pending-stk-payment";
const MAX_AGE_MS = 30 * 60 * 1000;

const canUseStorage = () => typeof window !== "undefined";

const isPendingStkPayment = (value: unknown): value is PendingStkPayment => {
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;

  return (
    typeof record.donationId === "string" &&
    typeof record.amount === "string" &&
    typeof record.phone === "string" &&
    typeof record.currency === "string" &&
    typeof record.createdAt === "number"
  );
};

export const savePendingStkPayment = (payment: PendingStkPayment) => {
  if (!canUseStorage()) return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payment));
};

export const getPendingStkPayment = (): PendingStkPayment | null => {
  if (!canUseStorage()) return null;

  const rawValue = window.sessionStorage.getItem(STORAGE_KEY);
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue) as unknown;

    if (!isPendingStkPayment(parsed)) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    if (Date.now() - parsed.createdAt > MAX_AGE_MS) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    window.sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const clearPendingStkPayment = () => {
  if (!canUseStorage()) return;
  window.sessionStorage.removeItem(STORAGE_KEY);
};