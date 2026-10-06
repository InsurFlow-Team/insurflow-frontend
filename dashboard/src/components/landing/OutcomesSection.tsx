import Reveal from "./Reveal";

const OUTCOMES = [
  {
    number: "01",
    title: "رؤية أوضح",
    description: "اعرف أين وصلت كل مطالبة وما الإجراء التالي.",
  },
  {
    number: "02",
    title: "تنسيق أفضل",
    description: "اربط فريق المطالبات بالمعاينين ضمن نفس المسار.",
  },
  {
    number: "03",
    title: "توثيق متصل",
    description: "اجمع بيانات المعاينة والصور والتقارير ضمن ملف المطالبة.",
  },
];

export default function OutcomesSection() {
  return (
    <section id="outcomes" className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto mb-10 max-w-3xl text-center lg:mb-14">
          <p className="mb-3 text-xs font-bold text-primary sm:text-sm">
            الأثر
          </p>
          <h2 className="text-2xl leading-tight font-black text-navy-700 sm:text-3xl lg:text-4xl">
            صَوْن لا تضيف خطوة جديدة. بل تربط الخطوات الموجودة.
          </h2>
        </Reveal>

        <div className="grid gap-8 sm:grid-cols-3 sm:gap-10">
          {OUTCOMES.map((outcome, index) => (
            <Reveal
              key={outcome.number}
              delay={index * 130}
              className="border-t-2 border-navy-700/15 pt-6"
            >
              <span className="block text-4xl font-black text-navy-300 lg:text-5xl">
                {outcome.number}
              </span>
              <h3 className="mt-4 mb-2 text-lg font-black text-text lg:text-xl">
                {outcome.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-muted lg:text-base">
                {outcome.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
