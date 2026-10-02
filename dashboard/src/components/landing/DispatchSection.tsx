import { MapPin, UserCheck, Navigation, Clock } from "lucide-react";

export default function DispatchSection() {
  return (
    <section className="py-20 lg:py-28 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Copy */}
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy-700 leading-tight mb-6">
              المعاين المناسب، في المكان المناسب.
            </h2>
            <p className="text-lg text-text-muted leading-relaxed mb-6">
              عند الحاجة إلى معاينة ميدانية، يمكن لموظف المطالبات رؤية المطالبات
              ومواقع المعاينين المتاحين، ثم اختيار المعاين المناسب للمهمة.
            </p>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-6">
              <p className="text-sm text-amber-800 leading-relaxed">
                <span className="font-bold">ملاحظة:</span> صَوْن تعرض المعلومات
                التي تساعد موظف المطالبات على اتخاذ قرار التعيين؛ القرار يبقى
                بيد الشركة.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { icon: MapPin, label: "موقع الحادث" },
                { icon: UserCheck, label: "موقع المعاين" },
                { icon: Navigation, label: "المسافة" },
                { icon: Clock, label: "اختيار المعاين وتعيينه" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center">
                      <Icon size={16} className="text-primary" />
                    </div>
                    <span className="text-sm font-medium text-text">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visual: Real map screenshot */}
          <div className="flex max-h-[420px] items-center justify-center overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
            <img
              src="/screenshots/dispatch-map.png"
              alt="خريطة التوزيع في صَوْن"
              className="h-auto max-h-[420px] w-full object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
