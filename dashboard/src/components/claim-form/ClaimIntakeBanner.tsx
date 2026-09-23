import { AlertCircle } from "lucide-react";

export default function ClaimIntakeBanner() {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-primary-light border border-primary/10">
      <AlertCircle size={18} className="text-primary mt-0.5 flex-shrink-0" />
      <div className="text-sm">
        <p className="font-medium text-primary mb-1">إنشاء مطالبة جديدة</p>
        <p className="text-text-muted">
          بيانات العميل والمركبة تم التحقق منها من وثيقة التأمين وهي للعرض فقط.
          سجّل بيانات الحادث أدناه.
        </p>
      </div>
    </div>
  );
}