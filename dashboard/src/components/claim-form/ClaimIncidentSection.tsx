import FormField from "../ui/FormField";
import Select from "../ui/Select";
import FormSectionHeader from "./FormSectionHeader";
import { INCIDENT_TYPE_OPTIONS } from "./claimFormConstants";
import type { ClaimFormSectionProps } from "./claimFormConstants";

/**
 * Incident information section for claim intake.
 * 
 * Collects:
 * - incidentType (dropdown)
 * - incidentLocation (text description)
 * - incidentDate (date picker)
 * 
 * This is simpler than the old IncidentInfoSection because customer/vehicle
 * info comes from policy verification.
 */
export default function ClaimIncidentSection({
  values,
  errors,
  onChange,
  disabled,
}: ClaimFormSectionProps) {
  return (
    <div className="space-y-4">
      <FormSectionHeader
        title="معلومات الحادث"
        subtitle="تفاصيل الحادث المُبلغ عنه"
      />

      <FormField label="نوع الحادث" required error={errors.incidentType}>
        <Select
          name="incidentType"
          value={values.incidentType || ""}
          onChange={onChange}
          disabled={disabled}
          error={errors.incidentType}
          placeholder="اختر نوع الحادث"
          options={INCIDENT_TYPE_OPTIONS}
        />
      </FormField>

      <FormField
        label="وصف موقع الحادث"
        required
        error={errors.incidentLocation}
      >
        <input
          type="text"
          name="incidentLocation"
          value={values.incidentLocation || ""}
          onChange={onChange}
          disabled={disabled}
          placeholder="مثال: شارع الملك فهد، بالقرب من..."
          className={`
            w-full rounded-lg border bg-background text-sm text-text
            px-4 py-2.5 placeholder:text-text-muted/50
            focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            transition duration-150
            ${errors.incidentLocation ? "border-danger focus:ring-danger/40 focus:border-danger" : "border-border"}
          `}
        />
      </FormField>

      <FormField label="تاريخ الحادث" required error={errors.incidentDate}>
        <input
          type="date"
          name="incidentDate"
          value={values.incidentDate || ""}
          onChange={onChange}
          disabled={disabled}
          max={new Date().toISOString().split("T")[0]}
          className={`
            w-full rounded-lg border bg-background text-sm text-text
            px-4 py-2.5
            focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            transition duration-150
            ${errors.incidentDate ? "border-danger focus:ring-danger/40 focus:border-danger" : "border-border"}
          `}
        />
        <p className="mt-1.5 text-xs text-text-muted">
          تاريخ وقوع الحادث (لا يمكن أن يكون في المستقبل)
        </p>
      </FormField>
    </div>
  );
}
