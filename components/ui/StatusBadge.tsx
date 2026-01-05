import clsx from "clsx";
import { InvoiceStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  const color = {
    draft: "bg-yellow-100 text-yellow-800",
    open: "bg-red-100 text-red-800",
    paid: "bg-green-100 text-green-800",
    void: "bg-gray-200 text-gray-700",
  }[status];
  return <span className={clsx("rounded-full px-3 py-1 text-xs font-semibold", color)}>{status}</span>;
}
