import api from "./api";
import type {
  CreatePssPlanPayload,
  PssLinkResponse,
  PssPlanListResponse,
  PssPlanResponse,
  PssPublicPlanResponse,
  PssPurchasesResponse,
  PssReceiptResponse,
  PssRecordPaymentResponse,
  PssRespondResponse,
  RecordPssPaymentPayload,
  UpdatePssPlanPayload,
} from "@/types/pss.types";

export const pssService = {
  listPlans: async () => api.get<PssPlanListResponse, PssPlanListResponse>("/pss/plans"),
  getPlan: async (id: string) => api.get<PssPlanResponse, PssPlanResponse>(`/pss/plans/${id}`),
  createPlan: async (payload: CreatePssPlanPayload) =>
    api.post<PssPlanResponse, PssPlanResponse>("/pss/plans", payload),
  updatePlan: async (id: string, payload: UpdatePssPlanPayload) =>
    api.patch<PssPlanResponse, PssPlanResponse>(`/pss/plans/${id}`, payload),
  recordPayment: async (id: string, payload: RecordPssPaymentPayload) =>
    api.post<PssRecordPaymentResponse, PssRecordPaymentResponse>(`/pss/plans/${id}/payments`, payload),
  reversePayment: async (id: string, paymentId: string, reason: string) =>
    api.post<PssPlanResponse, PssPlanResponse>(`/pss/plans/${id}/payments/${paymentId}/reverse`, { reason }),
  listPurchases: async () => api.get<PssPurchasesResponse, PssPurchasesResponse>("/pss/purchases"),

  // Public customer link (no login needed)
  getPublicPlan: async (token: string) =>
    api.get<PssPublicPlanResponse, PssPublicPlanResponse>(`/pss/public/${encodeURIComponent(token)}`),
  getReceipt: async (token: string, receiptNumber: string) =>
    api.get<PssReceiptResponse, PssReceiptResponse>(
      `/pss/public/${encodeURIComponent(token)}/receipts/${encodeURIComponent(receiptNumber)}`
    ),
  respond: async (token: string, paymentId: string, last4: string, action: "confirm" | "dispute") =>
    api.post<PssRespondResponse, PssRespondResponse>(
      `/pss/public/${encodeURIComponent(token)}/payments/${paymentId}/respond`,
      { last4, action }
    ),
  linkToMe: async (token: string) =>
    api.post<PssLinkResponse, PssLinkResponse>(`/pss/public/${encodeURIComponent(token)}/link`),
};
