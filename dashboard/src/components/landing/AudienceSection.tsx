import { Building2, FileText, MapPin, User } from "lucide-react";

const AUDIENCES = [
  {
    icon: Building2,
    title: "شركات التأمين",
    description: "إدارة ومتابعة دورة المطالبة من مكان واحد.",
    primary: true,
  },
  {
    icon: FileText,
    title: "موظفو المطالبات",
    description: "إدارة المطالبات والتعيينات والمراجعة ضمن رحلة واضحة.",
    primary: true,
  },
  {
    icon: MapPin,
    title: "المعاينون الميدانيون",
    description: "استقبال المهام وتوثيق المعاينة والأدلة من الميدان.",
    primary: true,
  },
  {
    icon: User,
    title: "العميل",
    description: "تجربة أوضح ومتابعة أكثر تنظيمًا لرحلة المطالبة.",
    primary: false,
  },
];

export default function AudienceSection() {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy-700 leading-tight mb-6">
            مصممة لكل طرف في رحلة المطالبة.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {AUDIENCES.map((audience) => {
            const Icon = audience.icon;
            return (
              <div
                key={audience.title}
                className={`rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow ${
                  audience.primary
                    ? "border-primary/20 bg-surface"
                    : "border-border bg-surface-soft"
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                  audience.primary ? "bg-primary-light" : "bg-surface-sunken"
                }`}>
                  <Icon size={22} className={audience.primary ? "text-primary" : "text-text-muted"} />
                </div>
                <h3 className="text-lg font-bold text-text mb-2">{audience.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{audience.description}</p>
                {!audience.primary && (
                  <span className="inline-block mt-3 rounded-full bg-surface-sunken px-2.5 py-0.5 text-xs text-text-muted">
                    مستفيد غير مباشر
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

