const SCREENS = [
  {
    title: "استقبال المهمة",
    labels: ["مطالبة جديدة", "قبول المهمة", "رفض المهمة"],
    image: "/screenshots/mobile-assignment.png",
  },
  {
    title: "المعاينة الميدانية",
    labels: ["بدء المعاينة", "تفاصيل الحادث", "الأضرار"],
    image: "/screenshots/mobile-inspection.png",
  },
  {
    title: "الأدلة والتوقيع",
    labels: ["الأدلة", "التوقيع", "إرسال للمراجعة"],
    image: "/screenshots/mobile-evidence.png",
  },
];

export default function FieldAdjusterSection() {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy-700 leading-tight mb-6">
            المعاينة الميدانية تبدأ من الهاتف.
          </h2>
          <p className="text-lg text-text-muted leading-relaxed">
            يستقبل المعاين المهمة على تطبيق الهاتف، ثم يوثق تفاصيل الحادث
            والمعاينة والموقع والأدلة قبل إرسال المطالبة للمراجعة.
          </p>
        </div>

        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-8 sm:overflow-visible sm:px-0 sm:pb-0">
          {SCREENS.map((screen) => {
            return (
              <div
                key={screen.title}
                className="flex w-36 shrink-0 snap-center flex-col items-center text-center sm:w-auto sm:shrink"
              >
                {/* Phone mockup with real screenshot */}
                <div className="mb-4 aspect-[9/20] w-full max-w-[170px] overflow-hidden rounded-2xl border-2 border-navy-700 bg-surface shadow-lg sm:mb-6">
                  <img
                    src={screen.image}
                    alt={screen.title}
                    className="h-full w-full object-contain"
                  />
                </div>

                <h3 className="mb-2 text-base font-bold text-text sm:text-lg">
                  {screen.title}
                </h3>
                <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                  {screen.labels.map((label) => (
                    <span
                      key={label}
                      className="rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] text-text-muted sm:px-2.5 sm:text-xs"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
