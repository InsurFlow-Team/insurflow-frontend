import { useRef, useState, type KeyboardEvent } from "react";

import Reveal from "./Reveal";

type ShowcaseImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

type ShowcaseTab = {
  id: string;
  label: string;
  title: string;
  description: string;
  layout: "wide" | "phones";
  images: ShowcaseImage[];
};

const TABS: ShowcaseTab[] = [
  {
    id: "claims",
    label: "إدارة المطالبات",
    title: "رؤية أوضح لكل مطالبة.",
    description:
      "تابع حالة المطالبات والإجراءات المطلوبة من مكان واحد، دون بحث في ملفات أو رسائل متفرقة.",
    layout: "wide",
    images: [
      {
        src: "/screenshots/gallery-dashboard.png",
        alt: "لوحة مطالبات صَوْن تعرض الحالات والإجراءات المطلوبة",
        width: 1542,
        height: 761,
      },
    ],
  },
  {
    id: "dispatch",
    label: "الإسناد",
    title: "اربط المهمة بالمعاين المناسب.",
    description:
      "نظّم إسناد المهام لموقع المعاين ومتابعة العمل الميداني من نفس الشاشة.",
    layout: "wide",
    images: [
      {
        src: "/screenshots/dispatch-map.png",
        alt: "خريطة إسناد مهام المعاينة للمعاينين الميدانيين",
        width: 1515,
        height: 735,
      },
    ],
  },
  {
    id: "field",
    label: "المعاينة الميدانية",
    title: "المعاينة تبدأ من الميدان.",
    description:
      "نفّذ المعاينة ووثّق الأضرار والصور والتقرير ضمن نفس رحلة المطالبة.",
    layout: "phones",
    images: [
      {
        src: "/screenshots/mobile-inspection.png",
        alt: "نموذج المعاينة الميدانية في تطبيق صَوْن",
        width: 921,
        height: 2048,
      },
      {
        src: "/screenshots/mobile-evidence.png",
        alt: "توثيق الأدلة والصور في تطبيق صَوْن",
        width: 921,
        height: 2048,
      },
    ],
  },
];

export default function ProductShowcase() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const tab = TABS[active];

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    let next: number | null = null;

    if (event.key === "ArrowLeft") next = (active + 1) % TABS.length;
    if (event.key === "ArrowRight")
      next = (active - 1 + TABS.length) % TABS.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = TABS.length - 1;

    if (next === null) return;
    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section id="platform" className="bg-navy-700 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-xs font-bold text-white/50 sm:text-sm">
            المنصة
          </p>
          <h2 className="text-2xl leading-tight font-black text-white sm:text-3xl lg:text-4xl">
            كل خطوة في رحلة المطالبة، في مكانها.
          </h2>
        </Reveal>

        <Reveal delay={100} className="mt-8 flex justify-center">
          <div
            role="tablist"
            aria-label="أقسام المنصة"
            className="inline-flex flex-wrap justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-1.5"
          >
            {TABS.map((item, index) => (
              <button
                key={item.id}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                type="button"
                role="tab"
                id={`showcase-tab-${item.id}`}
                aria-controls={`showcase-panel-${item.id}`}
                aria-selected={active === index}
                tabIndex={active === index ? 0 : -1}
                onClick={() => setActive(index)}
                onKeyDown={onKeyDown}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors duration-200 motion-reduce:transition-none ${
                  active === index
                    ? "bg-white text-navy-700 shadow-sm"
                    : "text-white/65 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </Reveal>

        <div
          key={tab.id}
          role="tabpanel"
          id={`showcase-panel-${tab.id}`}
          aria-labelledby={`showcase-tab-${tab.id}`}
          tabIndex={0}
          className="showcase-panel mt-8 lg:mt-12"
        >
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-12">
            <div>
              <h3 className="mb-3 text-xl font-black text-white sm:text-2xl">
                {tab.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/65 sm:text-base">
                {tab.description}
              </p>
            </div>

            <figure className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10 bg-background shadow-[0_30px_70px_-40px_rgba(0,0,0,0.8)] sm:aspect-[16/10] lg:aspect-[16/9]">
              {tab.layout === "wide" ? (
                <img
                  src={tab.images[0].src}
                  alt={tab.images[0].alt}
                  width={tab.images[0].width}
                  height={tab.images[0].height}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center gap-4 sm:gap-6">
                  {tab.images.map((image) => (
                    <div
                      key={image.src}
                      className="aspect-[921/2048] h-[88%] overflow-hidden rounded-2xl border-[3px] border-navy-700 bg-navy-700 shadow-xl"
                    >
                      <img
                        src={image.src}
                        alt={image.alt}
                        width={image.width}
                        height={image.height}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
