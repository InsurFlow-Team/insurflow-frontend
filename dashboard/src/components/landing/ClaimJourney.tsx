

const STEPS = [
  { number: "01", title: "التحقق من الوثيقة", description: "التحقق من وثيقة التأمين والمركبة" },
  { number: "02", title: "إنشاء المطالبة", description: "إنشاء مطالبة مرتبطة بالوثيقة الموثقة" },
  { number: "03", title: "تعيين المعاين", description: "اختيار المعاين المناسب للمهمة" },
  { number: "04", title: "المعاينة الميدانية", description: "توثيق تفاصيل الحادث والأضرار" },
  { number: "05", title: "توثيق الأدلة", description: "رفع صور المعاينة والتوقيع" },
  { number: "06", title: "المراجعة", description: "مراجعة ملف المطالبة والبيانات" },
  { number: "07", title: "القرار", description: "اتخاذ الإجراء المناسب وفق إجراءات الشركة" },
  { number: "08", title: "الإغلاق", description: "إغلاق ملف المطالبة بعد استكمال الرحلة" },
];

export default function ClaimJourney() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy-700 leading-tight mb-4">
            مسار واحد للمطالبة.
          </h2>
          <p className="text-lg text-text-muted">
            من التحقق من الوثيقة إلى إغلاق ملف المطالبة.
          </p>
        </div>

        {/* Desktop: horizontal workflow */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connection line */}
            <div className="absolute top-8 left-8 right-8 h-0.5 bg-border" />

            <div className="grid grid-cols-8 gap-4">
              {STEPS.map((step, index) => (
                <div key={step.number} className="relative flex flex-col items-center text-center">
                  {/* Dot */}
                  <div className="relative z-10 w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4">
                    <span className="text-white font-bold text-sm">{step.number}</span>
                  </div>

                  {/* Arrow to next */}
                  {index < STEPS.length - 1 && (
                    <div className="hidden" />
                  )}

                  <h3 className="text-sm font-bold text-text mb-1 leading-tight">{step.title}</h3>
                  <p className="text-xs text-text-muted leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet: vertical timeline */}
        <div className="lg:hidden">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute top-0 bottom-0 right-8 w-0.5 bg-border" />

            <div className="space-y-8">
              {STEPS.map((step) => (
                <div key={step.number} className="relative flex gap-6 items-start">
                  {/* Dot */}
                  <div className="relative z-10 w-16 h-16 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-sm">{step.number}</span>
                  </div>

                  <div className="pt-2">
                    <h3 className="text-base font-bold text-text mb-1">{step.title}</h3>
                    <p className="text-sm text-text-muted">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

