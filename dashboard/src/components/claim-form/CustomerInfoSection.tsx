import { User, Phone, FileText } from "lucide-react";
import FormField from "../ui/FormField";
import Input from "../ui/Input";
import FormSectionHeader from "./FormSectionHeader";
import type { ClaimFormSectionProps } from "./claimFormConstants";

export default function CustomerInfoSection({
  values,
  errors,
  onChange,
  disabled,
}: ClaimFormSectionProps) {
  return (
    <div className="space-y-4">
      <FormSectionHeader icon={User} title="Customer Information" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Full Name" required error={errors.customerName}>
          <Input
            type="text"
            name="customerName"
            placeholder="e.g., Ahmed Ibrahim"
            value={values.customerName}
            onChange={onChange}
            error={errors.customerName}
            icon={<User size={16} />}
            disabled={disabled}
          />
        </FormField>

        <FormField label="Phone Number" required error={errors.customerPhone}>
          <Input
            type="tel"
            name="customerPhone"
            placeholder="05XXXXXXXX"
            value={values.customerPhone}
            onChange={onChange}
            error={errors.customerPhone}
            icon={<Phone size={16} />}
            disabled={disabled}
          />
        </FormField>
      </div>

      <FormField label="Policy Number">
        <Input
          type="text"
          name="insurancePolicyNumber"
          placeholder="e.g., POL-123456"
          value={values.insurancePolicyNumber || ""}
          onChange={onChange}
          icon={<FileText size={16} />}
          disabled={disabled}
        />
        <p className="mt-1.5 text-xs text-text-muted">
          Optional — pending backend support. Not synced to the server yet.
        </p>
      </FormField>
    </div>
  );
}