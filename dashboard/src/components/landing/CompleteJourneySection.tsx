const STEPS = [
  "التحقق",
  "الإنشاء",
  "التعيين",
  "المعاينة",
  "الإرسال",
  "المراجعة",
  "اتخاذ القرار",
  "الإغلاق",
];

export default function CompleteJourneySection() {
  return (
    <section className="py-20 lg:py-28 bg-navy-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-4">
            مطالبة واحدة. رحلة كاملة.
          </h2>
          <p className="-lg text-white/70">
            من أول تحقق من الوثيقة، إلى آخر خطوة في ملف المطالبة.
          </p>
        </div>

        {/* Desktop: horizontal */}
        <div className="hidden lg:flex items-center justify-center gap-2">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-xl bg-white/10 border border-white/20 flex flex-col items-center justify-center">
                  <span className="text-white font-bold text-sm">{step}</span>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-8 h-0.5 bg-white/30" />
              )}
            </div>
          ))}
        </div>

        {/* Mobile/Tablet: vertical */}
        <div className="lg:hidden flex flex-col items-center gap-3">
          {STEPS.map((step, i) => (
            <div key={step} className="flex flex-col items-center">
              <div className="w-48 h-16 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center gap-3">
                <span className="text-white font-bold text-sm">{step}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-0.5 h-4 bg-white/30" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
