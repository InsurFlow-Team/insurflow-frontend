import { LayoutDashboard, User, Car, UserCheck, Clock } from "lucide-react";

const HIGHLIGHTS = [
  { icon: LayoutDashboard, label: "╪ص╪د┘╪ر ╪د┘┘à╪╖╪د┘╪ذ╪ر" },
  { icon: User, label: "╪ذ┘è╪د┘╪د╪ز ╪د┘╪╣┘à┘è┘" },
  { icon: Car, label: "╪ذ┘è╪د┘╪د╪ز ╪د┘┘à╪▒┘â╪ذ╪ر" },
  { icon: UserCheck, label: "╪د┘╪ز╪╣┘è┘è┘" },
  { icon: Clock, label: "╪│╪ش┘ ╪د┘╪ح╪ش╪▒╪د╪ة╪د╪ز" },
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
                alt="┘┘ê╪ص╪ر ╪د┘┘à╪╖╪د┘╪ذ╪د╪ز ┘┘è ╪╡┘┘ê┘ْ┘"
                className="h-auto max-h-[320px] w-full object-contain"
              />
            </div>
          </div>

          {/* Copy */}
          <div className="order-1 lg:order-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy-700 leading-tight mb-6">
              ┘à┘ ┘à╪▒┘â╪▓ ┘ê╪د╪ص╪»╪î ┘è╪▒┘ë ┘à┘ê╪╕┘ ╪د┘┘à╪╖╪د┘╪ذ╪د╪ز ╪د┘╪╡┘ê╪▒╪ر ┘â╪د┘à┘╪ر.
            </h2>
            <p className="text-lg text-text-muted leading-relaxed mb-8">
              ┘è╪ز╪د╪ذ╪╣ ┘à┘ê╪╕┘ ╪د┘┘à╪╖╪د┘╪ذ╪د╪ز ╪ص╪د┘╪ر ┘â┘ ┘à╪╖╪د┘╪ذ╪ر╪î ╪ذ┘è╪د┘╪د╪ز ╪د┘┘ê╪س┘è┘é╪ر╪î ╪د┘╪ز╪╣┘è┘è┘╪î
              ╪د┘┘à╪╣╪د┘è┘╪ر╪î ╪د┘╪ث╪»┘╪ر╪î ┘ê╪د┘┘à╪▒╪د╪ش╪╣╪ر ╪╢┘à┘ ╪▒╪ص┘╪ر ┘ê╪د╪ص╪»╪ر.
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
