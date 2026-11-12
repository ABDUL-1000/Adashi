import { NoWalletNotice } from "@/components/wallet/NoWalletNotice";

// Wallet is disabled for the pilot: Adashi does not hold or move money.
export default function WalletPage() {
  return <NoWalletNotice />;
}
