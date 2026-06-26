import { Badge } from "./badge";
import { formatStatus } from "@/lib/utils/format";

export interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getVariant = (s: string) => {
    switch (s.toLowerCase()) {
      // Success/Good states
      case "completed":
      case "submitted":
      case "approved":
      case "reviewed":
      case "paid":
        return "success";

      // Warning/In-progress states
      case "confirmed":
      case "assigned":
      case "in_progress":
      case "draft":
      case "sent":
        return "warning";

      // Info/Pending states
      case "pending":
      case "not_started":
        return "info";

      // Destructive/Red states
      case "cancelled":
      case "refunded":
      case "failed":
      case "rejected":
      case "overdue":
        return "destructive";

      default:
        return "primary";
    }
  };

  return (
    <Badge variant={getVariant(status)}>
      {formatStatus(status)}
    </Badge>
  );
}
