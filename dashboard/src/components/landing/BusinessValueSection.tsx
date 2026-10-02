import { Cog, Timer, Eye, Search } from "lucide-react";

const VALUES = [
  {
    icon: Cog,
    title: "تشغيل أكثر تنظيمًا",
    description: "ربط الأطراف والخطوات ضمن مسار عمل واضح.",
  },
  {
    icon: Timer,
    title: "وقت أقل في المتابعة",
    description: "تقليل الاعتماد على الاتصالات والمتابعات المتفرقة.",
  },
  {
    icon: Eye,
    title: "رؤية أوضح",
    description: "معرفة حالة المطالبة ومن يتولى الخطوة التالية.",
  },
  {
    icon: Search,
    title: "تتبع أفضل",
    description: "سجل واضح للإجراءات والبيانات المرتبطة بالمطالبة.",
  },
];

export default function BusinessValueSection() {
  return (
    <section id="solution" className="py-20 lg:py-28 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy-700 leading-tight mb-6">
            لماذا صون؟
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {VALUES.map((value) => {
            const Icon = value.icon;
            return (
              <div
                key={value.title}
                className="rounded-xl border border-border bg-surface p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-primary-light flex items-center justify-center mb-4">
                  <Icon size={22} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold text-text mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="text-center max-w-2xl mx-auto">
          <p className="text-lg font-bold text-navy-700 leading-relaxed">
            صون لا تتخذ قرارات التأمين بدل الشركة.
            <br />
            صون تجعل عملية الوصول إلى القرار أكثر تنظيمًا ووضوحًا.
          </p>
        </div>
      </div>
    </section>
  );
}
