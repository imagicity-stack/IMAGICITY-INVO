import clsx from "classnames";
import { DocumentStatus } from "@/types/documents";

const badgeStyles: Record<DocumentStatus, string> = {
  draft: "bg-white text-gray-800 border border-gray-200",
  open: "bg-yellow-100 text-yellow-900 border border-yellow-300",
  paid: "bg-green-100 text-green-900 border border-green-300",
  void: "bg-red-100 text-red-900 border border-red-300",
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  return <span className={clsx("tag", badgeStyles[status])}>{status}</span>;
}
