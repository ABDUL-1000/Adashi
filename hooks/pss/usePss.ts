import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { pssService } from "@/services/pss.service";
import type { CreatePssPlanPayload, RecordPssPaymentPayload, UpdatePssPlanPayload } from "@/types/pss.types";

export const pssKeys = {
  plans: ["pss", "plans"] as const,
  plan: (id: string) => ["pss", "plans", id] as const,
  purchases: ["pss", "purchases"] as const,
  publicPlan: (token: string) => ["pss", "public", token] as const,
  receipt: (token: string, receipt: string) => ["pss", "receipt", token, receipt] as const,
};

export function usePssPlans() {
  return useQuery({ queryKey: pssKeys.plans, queryFn: pssService.listPlans });
}

export function usePssPlan(id: string | undefined) {
  return useQuery({
    queryKey: pssKeys.plan(id ?? ""),
    queryFn: () => pssService.getPlan(id as string),
    enabled: Boolean(id),
  });
}

export function usePssPurchases(enabled = true) {
  return useQuery({ queryKey: pssKeys.purchases, queryFn: pssService.listPurchases, enabled });
}

export function usePssPublicPlan(token: string | undefined) {
  return useQuery({
    queryKey: pssKeys.publicPlan(token ?? ""),
    queryFn: () => pssService.getPublicPlan(token as string),
    enabled: Boolean(token),
    retry: false,
  });
}

export function usePssReceipt(token: string | undefined, receiptNumber: string | undefined) {
  return useQuery({
    queryKey: pssKeys.receipt(token ?? "", receiptNumber ?? ""),
    queryFn: () => pssService.getReceipt(token as string, receiptNumber as string),
    enabled: Boolean(token && receiptNumber),
    retry: false,
  });
}

function useInvalidatePlan() {
  const queryClient = useQueryClient();
  return (id: string) => {
    queryClient.invalidateQueries({ queryKey: pssKeys.plan(id) });
    queryClient.invalidateQueries({ queryKey: pssKeys.plans });
  };
}

export function useCreatePssPlan() {
  const invalidate = useInvalidatePlan();
  return useMutation({
    mutationFn: (payload: CreatePssPlanPayload) => pssService.createPlan(payload),
    onSuccess: (response) => invalidate(response.data.id),
  });
}

export function useUpdatePssPlan() {
  const invalidate = useInvalidatePlan();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePssPlanPayload }) => pssService.updatePlan(id, payload),
    onSuccess: (_response, variables) => invalidate(variables.id),
  });
}

export function useRecordPssPayment() {
  const invalidate = useInvalidatePlan();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RecordPssPaymentPayload }) =>
      pssService.recordPayment(id, payload),
    onSuccess: (_response, variables) => invalidate(variables.id),
  });
}

export function useReversePssPayment() {
  const invalidate = useInvalidatePlan();
  return useMutation({
    mutationFn: ({ id, paymentId, reason }: { id: string; paymentId: string; reason: string }) =>
      pssService.reversePayment(id, paymentId, reason),
    onSuccess: (_response, variables) => invalidate(variables.id),
  });
}

export function useRespondToPssPayment(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, last4, action }: { paymentId: string; last4: string; action: "confirm" | "dispute" }) =>
      pssService.respond(token, paymentId, last4, action),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pssKeys.publicPlan(token) }),
  });
}
