import { LayoutDashboard, User, Car, UserCheck, Clock } from "lucide-react";

const HIGHLIGHTS = [
  { icon: LayoutDashboard, label: "حالة المطالبة" },
  { icon: User, label: "بيانات العميل" },
  { icon: Car, label: "بيانات المركبة" },
  { icon: UserCheck, label: "التعيين" },
  { icon: Clock, label: "سجل الإجراءات" },
];

export default function ClaimsOfficerSection() {
  return (
    <section id="platform" className="py-20 lg:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Visual: Real dashboard screenshot */}
          <div className="order-2 lg:order-1">
            <div className="flex max-h-[320px] items-center justify-center overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
              <img
                src="/screenshots/claims-dashboard.png"
                alt="لوحة المطالبات في صَوْن"
                className="h-auto max-h-[320px] w-full object-contain"
              />
            </div>
          </div>

          {/* Copy */}
          <div className="order-1 lg:order-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy-700 leading-tight mb-6">
              من مركز واحد، يرى موظف المطالبات الصورة كاملة.
            </h2>
            <p className="text-lg text-text-muted leading-relaxed mb-8">
              يتابع موظف المطالبات حالة كل مطالبة، بيانات الوثيقة، التعيين،
              المعاينة، الأدلة، والمراجعة ضمن رحلة واحدة.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {HIGHLIGHTS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5"
                  >
                    <Icon size={16} className="text-primary shrink-0" />
                    <span className="text-sm font-medium text-text">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
