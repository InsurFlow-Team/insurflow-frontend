import { useRef, type CSSProperties } from "react";

import { useInView } from "./useInView";
import Reveal from "./Reveal";

const STEPS = [
  { number: "01", title: "إنشاء المطالبة" },
  { number: "02", title: "إسناد المعاين" },
  { number: "03", title: "المعاينة الميدانية" },
  { number: "04", title: "توثيق الأضرار" },
  { number: "05", title: "المراجعة" },
  { number: "06", title: "القرار والإغلاق" },
];

export default function ClaimJourney() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const revealed = useInView(wrapperRef, { threshold: 0.2 });

  const stepState = (index: number) => ({
    className: `landing-reveal ${revealed ? "is-visible" : ""}`,
    style: { "--reveal-delay": `${index * 140}ms` } as CSSProperties,
  });

  return (
    <section id="journey" className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto mb-10 max-w-3xl text-center lg:mb-16">
          <p className="mb-3 text-xs font-bold text-primary sm:text-sm">
            رحلة المطالبة
          </p>
          <h2 className="text-2xl leading-tight font-black text-navy-700 sm:text-3xl lg:text-4xl">
            من البلاغ إلى إغلاق المطالبة.
          </h2>
          <p className="mt-4 text-base text-text-muted lg:text-lg">
            ستة خطوات متصلة في مسار واحد، كل خطوة تُغذّي التي بعدها.
          </p>
        </Reveal>

        <div
          ref={wrapperRef}
          className={`journey-reveal ${revealed ? "is-revealed" : ""}`}
        >
          {/* Desktop: horizontal journey */}
          <div className="journey-stage relative hidden lg:block">
            <span className="journey-track journey-track--h" aria-hidden="true" />
            <ol className="grid grid-cols-6 gap-4">
              {STEPS.map((step, index) => (
                <li
                  key={step.number}
                  className={`flex flex-col items-center text-center ${stepState(index).className}`}
                  style={stepState(index).style}
                >
                  <span className="z-10 mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface text-sm font-black text-navy-700 shadow-[0_2px_8px_rgba(15,22,50,0.06)]">
                    {step.number}
                  </span>
                  <h3 className="text-sm leading-snug font-bold text-text lg:text-base">
                    {step.title}
                  </h3>
                </li>
              ))}
            </ol>
          </div>

          {/* Mobile / tablet: vertical journey */}
          <div className="journey-stage relative lg:hidden">
            <span className="journey-track journey-track--v" aria-hidden="true" />
            <ol className="space-y-5">
              {STEPS.map((step, index) => (
                <li
                  key={step.number}
                  className={`flex items-center gap-4 ${stepState(index).className}`}
                  style={stepState(index).style}
                >
                  <span className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-sm font-black text-navy-700 shadow-[0_2px_8px_rgba(15,22,50,0.06)]">
                    {step.number}
                  </span>
                  <span className="text-base font-bold text-text">
                    {step.title}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
