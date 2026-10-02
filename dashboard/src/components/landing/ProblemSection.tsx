import { RefreshCw, Database, Users, Search } from "lucide-react";

const PROBLEMS = [
  {
    icon: RefreshCw,
    title: "متابعة متكررة",
    description: "اتصالات ومتابعات متفرقة بين الأطراف لمعرفة حالة المطالبة.",
  },
  {
    icon: Database,
    title: "بيانات متفرقة",
    description: "معلومات المطالبة موزعة بين أنظمة وسجلات مختلفة.",
  },
  {
    icon: Users,
    title: "صعوبة التنسيق",
    description:
      "تنسيق المعاينة الميدانية بين المعاين وشركة التأمين يتطلب جهدًا يدويًا.",
  },
  {
    icon: Search,
    title: "صعوبة التتبع",
    description: "صعوبة معرفة ماذا حدث للمطالبة ومتى ومن اتخذ كل إجراء.",
  },
];

export default function ProblemSection() {
  return (
    <section className="py-20 lg:py-28 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy-700 leading-tight mb-6">
            المشكلة ليست في وجود البيانات.
            <br />
            المشكلة في تشتت رحلة المطالبة.
          </h2>
          <p className="text-lg text-text-muted leading-relaxed">
            عندما تقع حادثة، تبدأ رحلة المطالبة بين العميل، شركة التأمين، موظف
            المطالبات والمعاين الميداني. وكل طرف يحتاج إلى جزء مختلف من
            المعلومات، والمتابعة بين هذه الأطراف قد تصبح معقدة وبطيئة.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PROBLEMS.map((problem) => {
            const Icon = problem.icon;
            return (
              <div
                key={problem.title}
                className="rounded-xl border border-border bg-surface p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-danger-bg flex items-center justify-center mb-4">
                  <Icon size={22} className="text-danger" />
                </div>
                <h3 className="text-lg font-bold text-text mb-2">
                  {problem.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {problem.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-xl font-bold text-primary">
            صون تجمع هذه الرحلة في مسار واحد.
          </p>
        </div>
      </div>
    </section>
  );
}
