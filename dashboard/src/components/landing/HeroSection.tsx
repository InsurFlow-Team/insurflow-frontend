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
              ┘à┘ ┘╪ص╪╕╪ر ╪د┘╪ص╪د╪»╪س ╪ح┘┘ë ╪ح╪║┘╪د┘é ╪د┘┘à╪╖╪د┘╪ذ╪ر.
              <br />
              <span className="text-primary">┘â┘ ╪┤┘è╪ة ┘┘è ┘à╪│╪د╪▒ ┘ê╪د╪ص╪».</span>
            </h1>

            <p className="text-lg text-text-muted leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              ╪╡┘┘ê┘ْ┘ ┘à┘╪╡╪ر ┘╪ح╪»╪د╪▒╪ر ┘à╪╖╪د┘╪ذ╪د╪ز ╪ز╪ث┘à┘è┘ ╪د┘┘à╪▒┘â╪ذ╪د╪ز╪î ╪ز╪▒╪ذ╪╖ ╪┤╪▒┘â╪ر ╪د┘╪ز╪ث┘à┘è┘ ┘ê┘à┘ê╪╕┘
              ╪د┘┘à╪╖╪د┘╪ذ╪د╪ز ┘ê╪د┘┘à╪╣╪د┘è┘ ╪د┘┘à┘è╪»╪د┘┘è ╪╢┘à┘ ╪▒╪ص┘╪ر ┘ê╪د╪╢╪ص╪ر╪î ┘à┘╪╕┘à╪ر ┘ê┘é╪د╪ذ┘╪ر ┘┘╪ز╪ز╪ذ╪╣.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="#platform"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3.5 text-base transition-colors"
                style={{ color: "white" }}
              >
                ╪د╪│╪ز┘â╪┤┘ ╪د┘┘à┘╪╡╪ر
                <ArrowLeft size={18} />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3.5 text-base transition-colors"
                style={{ color: "white" }}
              >
                <PlayCircle size={18} />
                ┘â┘è┘ ╪ز╪╣┘à┘ ╪╡┘┘ê┘ْ┘╪ا
              </a>
            </div>
          </div>

          {/* Visual: Dashboard + Mobile overlay */}
          <div className="relative">
            {/* Dashboard screenshot */}
            <div className="flex max-h-[420px] items-center justify-center overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
              <img
                src="/screenshots/dashboard.png"
                alt="┘┘ê╪ص╪ر ╪ز╪ص┘â┘à ╪╡┘┘ê┘ْ┘"
                className="h-auto max-h-[420px] w-full object-contain"
              />
            </div>

            {/* Mobile phone overlay ظ¤ bottom left */}
            <div className="absolute -bottom-8 -left-3 sm:-left-6 w-28 sm:w-36">
              <div className="rounded-2xl border-[3px] border-navy-700 bg-navy-700 shadow-2xl overflow-hidden">
                {/* Phone notch */}
                <div className="bg-navy-700 px-4 py-1 flex justify-center">
                  <div className="w-12 h-1.5 rounded-full bg-white/20" />
                </div>
                <img
                  src="/screenshots/mobile.png"
                  alt="╪ز╪╖╪ذ┘è┘é ╪╡┘┘ê┘ْ┘ ┘┘┘à╪╣╪د┘è┘"
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
