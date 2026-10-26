import { TransactionsView } from "./transactions-view";

// Rendered after the client-side session check, so it can't be prerendered.
export const instant = false;

export default function Page() {
  return <TransactionsView />;
}
