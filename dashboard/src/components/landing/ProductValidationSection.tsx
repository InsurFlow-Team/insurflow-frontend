import { ArrowDown } from "lucide-react";

import Reveal from "./Reveal";

const LOOP = [
  { title: "نبني", description: "نُنجز الوظيفة ضمن رحلة المطالبة." },
  { title: "نختبر", description: "نجربها مع مستخدمين فعليين." },
  { title: "نستمع", description: "نراجع ملاحظاتهم كما هي." },
  { title: "نحسّن", description: "نحوّل الملاحظة إلى تحسين في المنتج." },
];

export default function ProductValidationSection() {
  return (
    <section id="about" className="bg-surface py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal>
              <p className="mb-3 text-xs font-bold text-primary sm:text-sm">
                عن صَوْن
              </p>
              <h2 className="text-2xl leading-tight font-black text-navy-700 sm:text-3xl lg:text-4xl">
                نبني صَوْن مع مستخدميها.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-text-muted lg:text-lg">
                نختبر تجربة صَوْن مع مستخدمين فعليين، ونحوّل ملاحظاتهم إلى
                تحسينات مستمرة في المنتج ورحلة المطالبة.
              </p>
            </Reveal>

            <Reveal delay={120} className="mt-8 space-y-5 border-t border-border pt-8">
              <p className="text-sm leading-relaxed text-text-soft lg:text-base">
                صَوْن مشروع يركز على تنظيم عمليات مطالبات تأمين المركبات، من
                خلال ربط بيانات الوثيقة بالمطالبة والتعيين والمعاينة الميدانية
                والمراجعة ضمن مسار واحد.
              </p>
              <p className="text-sm leading-relaxed text-text-soft lg:text-base">
                هدفنا ليس استبدال الخبرة البشرية أو قرار شركة التأمين، بل بناء
                الأدوات التي تجعل هذه الخبرة تعمل على بيانات منظمة ورحلة واضحة.
              </p>
            </Reveal>
          </div>

          <div className="rounded-2xl border border-border bg-background p-6 shadow-sm lg:p-8">
            <h3 className="mb-6 text-base font-black text-text lg:text-lg">
              دورة العمل المستمرة
            </h3>

            <ol className="space-y-1">
              {LOOP.map((step, index) => (
                <li key={step.title}>
                  <Reveal
                    delay={index * 120}
                    className="flex items-start gap-4 rounded-lg px-2 py-3"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-black text-white">
                      {index + 1}
                    </span>
                    <span>
                      <span className="block text-sm font-black text-text lg:text-base">
                        {step.title}
                      </span>
                      <span className="block text-sm text-text-muted">
                        {step.description}
                      </span>
                    </span>
                  </Reveal>
                  {index < LOOP.length - 1 && (
                    <div className="flex justify-start ps-4" aria-hidden="true">
                      <ArrowDown size={16} className="text-navy-200" />
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
