import { Badge, type BadgeProps } from "@/components/ui/badge";

type Variant = BadgeProps["variant"];

export function priorityVariant(priority: string): Variant {
  switch (priority) {
    case "Critical":
      return "danger";
    case "High":
      return "warning";
    case "Medium":
      return "info";
    default:
      return "secondary";
  }
}

export function statusVariant(status: string): Variant {
  switch (status) {
    case "Done":
    case "Approved":
    case "Shipped":
      return "success";
    case "In Progress":
    case "Awaiting review":
      return "info";
    case "Changes requested":
    case "Blocked":
      return "danger";
    case "Planned":
    case "Queued":
      return "secondary";
    default:
      return "secondary";
  }
}

export function PriorityBadge({ priority }: { priority: string }) {
  return <Badge variant={priorityVariant(priority)}>{priority}</Badge>;
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={statusVariant(status)}>{status}</Badge>;
}
