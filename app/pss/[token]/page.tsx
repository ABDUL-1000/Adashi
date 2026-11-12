"use client";

import { useParams } from "next/navigation";

import { PublicPlanView } from "@/components/pss/PublicPlanView";

// Public customer page: no login needed. The long random token in the URL is the access key.
export default function PublicPssPlanPage() {
  const params = useParams<{ token: string }>();
  return <PublicPlanView token={params.token} />;
}
