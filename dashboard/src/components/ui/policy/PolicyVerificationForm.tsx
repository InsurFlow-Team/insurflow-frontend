import { FileText, Search } from "lucide-react";
import type { ChangeEvent, FormEvent, KeyboardEvent } from "react";
import Button from "../Button";
import FormField from "../FormField";
import Input from "../Input";
import InlineError from "../InlineError";

const POLICY_NUMBER_PLACEHOLDER = "e.g., POL-1000203";

interface PolicyVerificationFormProps {
  policyNumber: string;
  isVerifying: boolean;
  error: string;
  onPolicyNumberChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onVerify: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onClose: () => void;
}

export default function PolicyVerificationForm({
  policyNumber,
  isVerifying,
  error,
  onPolicyNumberChange,
  onVerify,
  onKeyDown,
  onClose,
}: PolicyVerificationFormProps) {
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onVerify();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Policy Number" required>
        <Input
          name="policyNumber"
          type="text"
          placeholder={POLICY_NUMBER_PLACEHOLDER}
          value={policyNumber}
          onChange={onPolicyNumberChange}
          onKeyDown={onKeyDown}
          disabled={isVerifying}
          icon={<FileText size={16} />}
          aria-label="Policy Number"
        />
      </FormField>

      <p className="text-xs text-text-muted">
        Development mock: any policy number verifies successfully, except{" "}
        <span className="font-mono text-text">00000000</span> (simulated failure
        for testing the error state).
      </p>

      {error && <InlineError message={error} />}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={isVerifying}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          icon={<Search size={15} />}
          loading={isVerifying}
          disabled={isVerifying || policyNumber.trim() === ""}
        >
          تحقق من الوثيقة
        </Button>
      </div>
    </form>
  );
}