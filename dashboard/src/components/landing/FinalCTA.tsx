import { ArrowLeft } from "lucide-react";

export default function FinalCTA() {
  return (
    <section
      id="demo"
      className="py-20 lg:py-28 bg-gradient-to-b from-navy-50 to-background"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy-700 leading-tight mb-6">
          جاهزون لرؤية رحلة المطالبة بشكل مختلف؟
        </h2>
        <p className="text-lg text-text-muted leading-relaxed mb-10">
          اكتشف كيف تربط صَوْن بين المكتب والميدان في مسار واحد.
        </p>
        <a
          href="/login"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold px-8 py-4 text-lg transition-colors"
          style={{ color: "white" }}
        >
          شاهد العرض التجريبي
          <ArrowLeft size={20} />
        </a>
      </div>
    </section>
  );
}
