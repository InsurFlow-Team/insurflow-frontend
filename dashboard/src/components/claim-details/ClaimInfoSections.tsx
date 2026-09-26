import ClaimOverviewSection from "./sections/ClaimOverviewSection";
import AssignmentSection from "./sections/AssignmentSection";
import VehicleSection from "./sections/VehicleSection";
import CustomerSection from "./sections/CustomerSection";
import PolicySection from "./sections/PolicySection";
import AccidentSection from "./sections/AccidentSection";
import IncidentLocationSection from "./sections/IncidentLocationSection";
import InspectionLocationSection from "./sections/InspectionLocationSection";
import EvidenceSection from "./sections/EvidenceSection";
import SignatureSection from "./sections/SignatureSection";
import DecisionSection from "./sections/DecisionSection";
import type { ClaimDetails } from "../../types";

interface ClaimInfoSectionsProps {
  claim: ClaimDetails;
  canAssign: boolean;
  onAssign: () => void;
  canDecide: boolean;
  deciding: boolean;
  onApprove: () => void;
  onReject: () => void;
}

export default function ClaimInfoSections({
  claim,
  canAssign,
  onAssign,
  canDecide,
  deciding,
  onApprove,
  onReject,
}: ClaimInfoSectionsProps) {
  return (
    <div className="space-y-6">
      <ClaimOverviewSection claim={claim} />

      <AssignmentSection
        claim={claim}
        canAssign={canAssign}
        onAssign={onAssign}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <CustomerSection claim={claim} />
        <PolicySection claim={claim} />
      </div>

      <VehicleSection claim={claim} />
      <AccidentSection claim={claim} />

      <IncidentLocationSection claim={claim} />
      <InspectionLocationSection claim={claim} />

      <EvidenceSection claim={claim} />
      <SignatureSection claim={claim} />
      <DecisionSection
        claim={claim}
        canDecide={canDecide}
        deciding={deciding}
        onApprove={onApprove}
        onReject={onReject}
      />
    </div>
  );
}