import { AlertCircle, MapPin, Calendar, Clock } from "lucide-react";
import FormField from "../ui/FormField";
import Input from "../ui/Input";
import Select from "../ui/Select";
import FormSectionHeader from "./FormSectionHeader";
import { INCIDENT_TYPE_OPTIONS } from "./claimFormConstants";
import type { ClaimFormSectionProps } from "./claimFormConstants";

export default function IncidentInfoSection({
  values,
  errors,
  onChange,
  disabled,
}: ClaimFormSectionProps) {
  return (
    <div className="space-y-4">
      <FormSectionHeader icon={AlertCircle} title="Incident Details" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Incident Type" required error={errors.incidentType}>
          <Select
            name="incidentType"
            value={values.incidentType}
            onChange={onChange}
            disabled={disabled}
            error={errors.incidentType}
            placeholder="Select incident type"
            options={INCIDENT_TYPE_OPTIONS}
          />
        </FormField>

        <FormField label="Incident Location" required error={errors.incidentLocation}>
          <Input
            type="text"
            name="incidentLocation"
            placeholder="e.g., Riyadh - King Fahd Road"
            value={values.incidentLocation}
            onChange={onChange}
            error={errors.incidentLocation}
            icon={<MapPin size={16} />}
            disabled={disabled}
          />
        </FormField>

        <FormField label="Incident Date" required error={errors.accidentDate}>
          <Input
            type="date"
            name="accidentDate"
            value={values.accidentDate}
            onChange={onChange}
            error={errors.accidentDate}
            icon={<Calendar size={16} />}
            disabled={disabled}
            max={new Date().toISOString().split("T")[0]}
          />
        </FormField>

        <FormField label="Incident Time" required error={errors.accidentTime}>
          <Input
            type="time"
            name="accidentTime"
            value={values.accidentTime}
            onChange={onChange}
            error={errors.accidentTime}
            icon={<Clock size={16} />}
            disabled={disabled}
          />
        </FormField>
      </div>
    </div>
  );
}