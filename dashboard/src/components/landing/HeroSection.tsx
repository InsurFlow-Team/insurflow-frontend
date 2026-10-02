import { ArrowLeft, PlayCircle } from "lucide-react";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="pt-28 pb-16 lg:pt-36 lg:pb-24 bg-gradient-to-b from-navy-50 to-background"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Copy */}
          <div className="text-center lg:text-right">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-navy-700 leading-tight mb-6">
              من لحظة الحادث إلى إغلاق المطالبة.
              <br />
              <span className="text-primary">كل شيء في مسار واحد.</span>
            </h1>

            <p className="text-lg text-text-muted leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              صَوْن منصة لإدارة مطالبات تأمين المركبات، تربط شركة التأمين وموظف
              المطالبات والمعاين الميداني ضمن رحلة واضحة، منظمة وقابلة للتتبع.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="#platform"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3.5 text-base transition-colors"
                style={{ color: "white" }}
              >
                استكشف المنصة
                <ArrowLeft size={18} />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3.5 text-base transition-colors"
                style={{ color: "white" }}
              >
                <PlayCircle size={18} />
                كيف تعمل صَوْن؟
              </a>
            </div>
          </div>

          {/* Visual: Dashboard + Mobile overlay */}
          <div className="relative">
            {/* Dashboard screenshot */}
            <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
              <img
                src="/screenshots/dashboard.png"
                alt="لوحة تحكم صَوْن"
                className="h-auto w-full object-cover"
              />
            </div>

            {/* Mobile phone overlay — bottom left */}
            <div className="absolute -bottom-8 -left-3 sm:-left-6 w-28 sm:w-36">
              <div className="rounded-2xl border-[3px] border-navy-700 bg-navy-700 shadow-2xl overflow-hidden">
                {/* Phone notch */}
                <div className="bg-navy-700 px-4 py-1 flex justify-center">
                  <div className="w-12 h-1.5 rounded-full bg-white/20" />
                </div>
                <img
                  src="/screenshots/mobile.png"
                  alt="تطبيق صَوْن للمعاين"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
