import { CheckCircle2 } from "lucide-react";

export default function PolicyVerificationSection() {
  return (
    <section className="py-20 lg:py-28 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Copy */}
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy-700 leading-tight mb-6">
              كل مطالبة تبدأ من وثيقة موثقة.
            </h2>
            <p className="text-lg text-text-muted leading-relaxed mb-8">
              قبل إنشاء المطالبة، يتم التحقق من وثيقة التأمين والمركبة. عند نجاح
              التحقق، تنتقل البيانات المؤكدة إلى عملية إنشاء المطالبة بدل إعادة
              إدخالها يدويًا.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success-bg flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-success-strong" />
                </div>
                <span className="text-text font-medium">
                  التحقق من أهلية الوثيقة قبل إنشاء المطالبة
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success-bg flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-success-strong" />
                </div>
                <span className="text-text font-medium">
                  البيانات المؤكدة تنتقل تلقائيًا إلى المطالبة
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success-bg flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-success-strong" />
                </div>
                <span className="text-text font-medium">
                  لا حاجة لإعادة إدخال بيانات العميل والمركبة
                </span>
              </div>
            </div>
          </div>

          {/* Visual: Real verification screenshot */}
          <div className="flex max-h-[420px] items-center justify-center overflow-hidden rounded-xl border border-border bg-background p-3 shadow-lg">
            <img
              src="/screenshots/policy-verification.png"
              alt="التحقق من الوثيقة في صَوْن"
              className="h-auto max-h-[396px] w-full object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
