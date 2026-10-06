import { ArrowLeft } from "lucide-react";

import Reveal from "./Reveal";

export default function FinalCTA() {
  return (
    <section
      id="demo"
      className="bg-gradient-to-b from-background to-navy-50 py-16 lg:py-24"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Reveal
          variant="scale"
          className="rounded-2xl border border-border bg-surface px-6 py-12 text-center shadow-[0_28px_60px_-42px_rgba(15,22,50,0.55)] sm:px-12 lg:py-16"
        >
          <h2 className="text-2xl leading-tight font-black text-navy-700 sm:text-3xl lg:text-4xl">
            جاهزون لتبسيط رحلة المطالبات؟
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-text-muted sm:text-lg">
            شاهد كيف يمكن لصَوْن أن تربط فريق المطالبات بالعمل الميداني في
            منصة واحدة.
          </p>
          <div className="mt-9">
            <a href="/login" className="landing-btn-primary landing-btn-lg">
              احجز عرضًا توضيحيًا
              <ArrowLeft size={20} />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
