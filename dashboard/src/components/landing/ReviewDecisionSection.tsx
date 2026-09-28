import { CheckCircle2, AlertTriangle } from "lucide-react";

export default function ReviewDecisionSection() {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy-700 leading-tight mb-6">
            القرار يعتمد على ملف المطالبة.
          </h2>
          <p className="text-lg text-text-muted leading-relaxed">
            تصل المطالبة إلى مرحلة المراجعة بعد استكمال المعاينة والبيانات المطلوبة، ليقوم موظف المطالبات بمراجعتها واتخاذ الإجراء المناسب وفق إجراءات الشركة.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Flow A: Approval */}
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <h3 className="text-lg font-bold text-text mb-6 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-success-strong" />
              مسار الموافقة
            </h3>

            <div className="space-y-3">
              {[
                { label: "تم إرسال المطالبة", color: "bg-info-muted" },
                { label: "قيد المراجعة", color: "bg-warning-muted" },
                { label: "تمت الموافقة", color: "bg-success-strong" },
                { label: "إغلاق المطالبة", color: "bg-navy-600" },
              ].map((step, i) => (
                <div key={step.label}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${step.color}`} />
                    <span className="text-sm font-medium text-text">{step.label}</span>
                  </div>
                  {i < 3 && (
                    <div className="mr-1.5 mt-1 mb-1 h-4 w-0.5 bg-border" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Flow B: Correction */}
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <h3 className="text-lg font-bold text-text mb-6 flex items-center gap-2">
              <AlertTriangle size={20} className="text-warning" />
              مسار التصحيح
            </h3>

            <div className="space-y-3">
              {[
                { label: "قيد المراجعة", color: "bg-warning-muted" },
                { label: "تحتاج إلى تصحيح", color: "bg-rose-strong" },
                { label: "إعادة الإرسال", color: "bg-info-muted" },
                { label: "قيد المراجعة", color: "bg-warning-muted" },
              ].map((step, i) => (
                <div key={step.label + i}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${step.color}`} />
                    <span className="text-sm font-medium text-text">{step.label}</span>
                  </div>
                  {i < 3 && (
                    <div className="mr-1.5 mt-1 mb-1 h-4 w-0.5 bg-border" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-success-strong" />
                <span className="text-sm font-medium text-text">تمت الموافقة</span>
              </div>
              <div className="mr-1.5 mt-1 mb-1 h-4 w-0.5 bg-border" />
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-navy-600" />
                <span className="text-sm font-medium text-text">إغلاق المطالبة</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

