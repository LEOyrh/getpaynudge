import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useInvoiceLimits } from "@/hooks/useInvoiceLimits";

interface NewInvoiceButtonProps {
  label?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary" | "ghost";
  className?: string;
}

export function NewInvoiceButton({
  label = "New Invoice",
  size = "default",
  variant = "default",
  className,
}: NewInvoiceButtonProps) {
  const navigate = useNavigate();
  const { atLimit, limit, activeCount, planKey } = useInvoiceLimits();

  const handleClick = () => {
    if (atLimit) {
      const planName = planKey.charAt(0).toUpperCase() + planKey.slice(1);
      toast.error(
        `${planName} plan limit reached (${activeCount}/${limit}). Mark one paid or upgrade.`,
        {
          action: {
            label: "Upgrade",
            onClick: () => navigate("/billing"),
          },
        }
      );
      return;
    }
    navigate("/invoices/new");
  };

  return (
    <Button
      size={size}
      variant={variant}
      className={className}
      onClick={handleClick}
    >
      {label}
    </Button>
  );
}
