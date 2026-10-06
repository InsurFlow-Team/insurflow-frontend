import { useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";

import Reveal from "./Reveal";

const FLOW = ["شركة التأمين", "فريق المطالبات", "المعاين الميداني"];

export default function HeroSection() {
  const visualRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    if (window.innerWidth < 1024) return;

    const node = visualRef.current;
    if (!node) return;

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const shift = Math.min(window.scrollY * 0.04, 22);
        node.style.setProperty("--hero-shift", `${shift}px`);
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      id="hero"
      className="bg-gradient-to-b from-navy-50 to-background pb-16 pt-28 lg:pb-24 lg:pt-36"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-right">
            <Reveal as="p" className="mb-5 text-xs font-bold text-primary sm:text-sm">
              لشركات التأمين · إدارة مطالبات المركبات
            </Reveal>

            <Reveal as="h1" delay={80} className="mb-6 text-3xl leading-[1.35] font-black text-navy-700 sm:text-4xl lg:text-5xl">
              المطالبة ما لازم تضيع
              <br className="hidden sm:block" />{" "}
              بين الأشخاص والخطوات.
            </Reveal>

            <Reveal
              as="p"
              delay={160}
              className="mx-auto mb-7 max-w-xl text-base leading-relaxed text-text-muted sm:text-lg lg:mx-0"
            >
              صَوْن منصة لإدارة مطالبات حوادث المركبات، تربط فريق المطالبات
              بالمعاينين الميدانيين في رحلة واحدة واضحة وقابلة للتتبّع.
            </Reveal>

            <Reveal
              delay={240}
              className="flex flex-col justify-center gap-3 sm:flex-row lg:justify-start"
            >
              <a href="#demo" className="landing-btn-primary">
                احجز عرضًا توضيحيًا
                <ArrowLeft size={18} />
              </a>
              <a href="#journey" className="landing-btn-secondary">
                شاهد كيف تعمل
              </a>
            </Reveal>

            <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-3 text-xs text-text-muted sm:text-sm lg:mt-7 lg:justify-start">
              {FLOW.map((item, index) => (
                <Reveal
                  key={item}
                  as="span"
                  delay={index * 280}
                  className="inline-flex items-center gap-2"
                >
                  <span className="font-bold text-text-soft ">{item}</span>
                  <span aria-hidden="true" className="text-navy-300 ">
                    ←
                  </span>
                </Reveal>
              ))}
              <Reveal
                as="span"
                delay={FLOW.length * 280}
                className="font-bold text-primary"
              >
                رحلة واحدة متصلة
              </Reveal>
            </p>
          </div>

          <div className="relative">
            <div ref={visualRef} className="hero-parallax">
              <Reveal
                variant="scale"
                delay={160}
                className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_24px_60px_-32px_rgba(15,22,50,0.45)]"
              >
                <img
                  src="/screenshots/dashboard.png"
                  alt="لوحة المطالبات في صَوْن"
                  width={1895}
                  height={907}
                  fetchPriority="high"
                  decoding="async"
                  className="h-auto w-full object-cover"
                />
              </Reveal>

              <Reveal
                delay={420}
                className="absolute -bottom-8 -left-3 w-28 sm:-left-6 sm:w-36 lg:w-40"
              >
                <div className="overflow-hidden rounded-2xl border-[3px] border-navy-700 bg-navy-700 shadow-2xl">
                  <div className="flex justify-center px-4 py-1">
                    <span className="h-1.5 w-12 rounded-full bg-white/25" />
                  </div>
                  <img
                    src="/screenshots/mobile.png"
                    alt="تطبيق المعاين الميداني"
                    width={921}
                    height={2048}
                    loading="lazy"
                    decoding="async"
                    className="h-auto w-full"
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
