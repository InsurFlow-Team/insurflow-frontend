const TIMELINE = [
  { title: "إنشاء المطالبة", status: "success" },
  { title: "تعيين المعاين", status: "info" },
  { title: "قبول المهمة", status: "info" },
  { title: "بدء المعاينة", status: "warning" },
  { title: "توثيق الأدلة", status: "warning" },
  { title: "قيد المراجعة", status: "info" },
];

const STATUS_COLORS: Record<string, string> = {
  success: "bg-success-strong",
  info: "bg-info-muted",
  warning: "bg-warning-muted",
};

export default function TraceabilitySection() {
  return (
    <section className="py-20 lg:py-28 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy-700 leading-tight mb-6">
            كل مطالبة لها قصة يمكن الرجوع إليها.
          </h2>
          <p className="text-lg text-text-muted leading-relaxed mb-4">
            من إنشاء المطالبة وحتى المراجعة والإغلاق، يتم ربط الإجراءات
            والبيانات والأدلة بتاريخ المطالبة.
          </p>
          <p className="text-base font-bold text-primary">
            ليس فقط أين وصلت المطالبة، بل ماذا حدث للوصول إليها.
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute top-0 bottom-0 right-6 w-0.5 bg-border" />

            <div className="space-y-6">
              {TIMELINE.map((event, index) => (
                <div
                  key={event.title}
                  className="relative flex gap-6 items-start"
                >
                  {/* Dot */}
                  <div className="relative z-10 w-12 h-12 rounded-full bg-surface border-2 border-border flex items-center justify-center shrink-0">
                    <div
                      className={`w-3 h-3 rounded-full ${STATUS_COLORS[event.status]}`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 rounded-lg border border-border bg-surface p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-bold text-text">
                        {event.title}
                      </h3>
                    </div>
                    <p className="text-xs text-text-muted">
                      {index === 0 &&
                        "تم إنشاء المطالبة وربطها بالوثيقة الموثقة"}
                      {index === 1 && "تم تعيين معاين ميداني للمطالبة"}
                      {index === 2 &&
                        "قبل المعاين المهمة وبدأ التحضير للمعاينة"}
                      {index === 3 && "وصل المعاين وبدأ توثيق تفاصيل الحادث"}
                      {index === 4 && "تم رفع صور المعاينة والتوقيع"}
                      {index === 5 && "المطالبة الآن في مرحلة المراجعة"}
                    </p>
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
