import { Eye, FileText, MapPin } from "lucide-react";

import Reveal from "./Reveal";

const ROLES = [
  {
    icon: FileText,
    title: "فريق المطالبات",
    description: "إدارة المطالبات ومتابعة حالتها.",
    tag: "مستخدم أساسي",
  },
  {
    icon: MapPin,
    title: "المعاينون الميدانيون",
    description: "استلام المهام وتنفيذ المعاينة وتوثيق الأضرار.",
    tag: "مستخدم أساسي",
  },
  {
    icon: Eye,
    title: "الإدارة",
    description: "رؤية أوضح لسير المطالبات والأداء التشغيلي.",
    tag: "مستخدم ثانوي",
  },
];

export default function AudienceSection() {
  return (
    <section id="audience" className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto mb-10 max-w-3xl text-center lg:mb-14">
          <h2 className="text-2xl leading-tight font-black text-navy-700 sm:text-3xl lg:text-4xl">
            صَوْن مصممة لشركات التأمين، ولكل شخص في رحلة المطالبة.
          </h2>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {ROLES.map((role, index) => {
            const Icon = role.icon;
            return (
              <Reveal
                key={role.title}
                delay={index * 110}
                className="rounded-xl border border-border bg-surface p-5 shadow-sm lg:p-6"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-light">
                    <Icon size={20} className="text-primary" />
                  </span>
                  <span className="rounded-full bg-surface-sunken px-2.5 py-0.5 text-xs font-bold text-text-muted">
                    {role.tag}
                  </span>
                </div>
                <h3 className="mb-1.5 text-lg font-bold text-text">
                  {role.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-muted">
                  {role.description}
                </p>
              </Reveal>
            );
          })}
        </div>

        <Reveal
          delay={120}
          className="mx-auto mt-8 max-w-3xl rounded-lg border border-border bg-surface px-5 py-4 text-center text-sm leading-relaxed text-text-soft lg:mt-10"
        >
          شركة التأمين هي العميل، وفريق المطالبات والمعاينون هم المستخدمون
          الأساسيون.
        </Reveal>
      </div>
    </section>
  );
}
