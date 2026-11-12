import type { ApiResponse } from "./api.types";

export type PssPlanStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";
export type PssCollectionRule = "PAY_BEFORE_COLLECT" | "COLLECT_AFTER_PART_PAYMENT";
export type PssPaymentMethod = "CASH" | "TRANSFER" | "OTHER";
export type PssCustomerStatus = "PENDING" | "CONFIRMED" | "DISPUTED";

/** All amounts are integer kobo. */
export type PssTotals = {
  totalPrice: number;
  paid: number;
  balance: number;
  percentPaid: number;
};

export type PssPayment = {
  id: string;
  amount: number;
  method: PssPaymentMethod;
  note: string | null;
  customerStatus: PssCustomerStatus;
  receiptNumber: string;
  isReversed: boolean;
  reversalReason: string | null;
  createdAt: string;
};

export type PssPlanRow = PssTotals & {
  id: string;
  customerName: string;
  itemName: string;
  status: PssPlanStatus;
  collected: boolean;
  dueDate: string | null;
  createdAt: string;
};

export type PssPlanList = {
  summary: { totalOutstanding: number; activePlans: number; completedPlans: number };
  plans: PssPlanRow[];
};

export type PssPlan = PssTotals & {
  id: string;
  customerName: string;
  customerPhone: string;
  customerLinked: boolean;
  itemName: string;
  itemDescription: string | null;
  dueDate: string | null;
  collectionRule: PssCollectionRule;
  status: PssPlanStatus;
  collected: boolean;
  shareToken: string;
  createdAt: string;
  payments: PssPayment[];
};

export type PssPublicPlan = PssTotals & {
  shopName: string;
  customerName: string;
  customerPhoneMasked: string;
  itemName: string;
  itemDescription: string | null;
  dueDate: string | null;
  collectionRule: PssCollectionRule;
  status: PssPlanStatus;
  collected: boolean;
  payments: PssPayment[];
};

export type PssReceipt = {
  receiptNumber: string;
  shopName: string;
  customerName: string;
  itemName: string;
  amount: number;
  method: PssPaymentMethod;
  note: string | null;
  paidAt: string;
  customerStatus: PssCustomerStatus;
  isReversed: boolean;
  reversalReason: string | null;
  totalPrice: number;
  totalPaidSoFar: number;
  balanceRemaining: number;
  fullyPaid: boolean;
};

export type PssPurchase = PssTotals & {
  shareToken: string;
  shopName: string;
  itemName: string;
  status: PssPlanStatus;
  dueDate: string | null;
};

export type CreatePssPlanPayload = {
  customerName: string;
  customerPhone: string;
  itemName: string;
  itemDescription?: string;
  totalPrice: number;
  deposit?: number;
  depositMethod?: PssPaymentMethod;
  dueDate?: string | null;
  collectionRule: PssCollectionRule;
};

export type UpdatePssPlanPayload = {
  collected?: boolean;
  cancel?: true;
  dueDate?: string | null;
};

export type RecordPssPaymentPayload = {
  amount: number;
  method: PssPaymentMethod;
  note?: string;
};

export type PssPlanListResponse = ApiResponse<PssPlanList>;
export type PssPlanResponse = ApiResponse<PssPlan>;
export type PssRecordPaymentResponse = ApiResponse<{ receiptNumber: string; plan: PssPlan }>;
export type PssPublicPlanResponse = ApiResponse<PssPublicPlan>;
export type PssReceiptResponse = ApiResponse<PssReceipt>;
export type PssPurchasesResponse = ApiResponse<PssPurchase[]>;
export type PssRespondResponse = ApiResponse<{ customerStatus: PssCustomerStatus }>;
export type PssLinkResponse = ApiResponse<{ linked: boolean; isShopOwner?: boolean }>;
