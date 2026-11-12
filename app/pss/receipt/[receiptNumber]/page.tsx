"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { ReceiptView } from "@/components/pss/ReceiptView";

function Receipt() {
  const params = useParams<{ receiptNumber: string }>();
  const searchParams = useSearchParams();
  return <ReceiptView receiptNumber={params.receiptNumber} token={searchParams.get("t") ?? ""} />;
}

// Public receipt: /pss/receipt/PSS-000123?t={share_token}
export default function PssReceiptPage() {
  return (
    <Suspense fallback={null}>
      <Receipt />
    </Suspense>
  );
}
