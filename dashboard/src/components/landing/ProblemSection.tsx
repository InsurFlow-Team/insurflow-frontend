import { ArrowDown, Eye, RefreshCw, Users } from "lucide-react";

import Reveal from "./Reveal";

const PAINS = [
  {
    icon: Users,
    title: "أشخاص",
    description: "أكثر من شخص يتعامل مع المطالبة في مراحل مختلفة.",
  },
  {
    icon: RefreshCw,
    title: "عمليات متقطعة",
    description: "اتصالات وملفات وأدوات متعددة تجعل المتابعة أصعب.",
  },
  {
    icon: Eye,
    title: "غياب الرؤية",
    description: "صعوبة معرفة أين وصلت المطالبة وما الخطوة التالية.",
  },
];

export default function ProblemSection() {
  return (
    <section id="problem" className="bg-surface py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto mb-10 max-w-3xl text-center lg:mb-14">
          <h2 className="text-2xl leading-tight font-black text-navy-700 sm:text-3xl lg:text-4xl">
            رحلة المطالبة لا يجب أن تكون موزعة بين الأشخاص والأدوات.
          </h2>
        </Reveal>

        <div className="grid gap-8 sm:grid-cols-3 sm:gap-10">
          {PAINS.map((pain, index) => {
            const Icon = pain.icon;
            return (
              <Reveal
                key={pain.title}
                delay={index * 130}
                className="border-t-2 border-danger/25 pt-5"
              >
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-danger-bg">
                  <Icon size={19} className="text-danger" />
                </span>
                <h3 className="mb-2 text-base font-black text-text lg:text-lg">
                  {pain.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-muted lg:text-base">
                  {pain.description}
                </p>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={160} className="mt-12 text-center lg:mt-16">
          <p className="text-lg font-black text-primary sm:text-xl">
            صَوْن تجمع هذه الرحلة في مسار واحد.
          </p>
          <span className="mt-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-primary-light text-primary">
            <ArrowDown size={18} aria-hidden="true" />
          </span>
        </Reveal>
      </div>
    </section>
  );
}
