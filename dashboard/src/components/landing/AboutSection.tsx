export default function AboutSection() {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy-700 leading-tight mb-8">
          نبني أدوات لمرحلة تحتاج فيها شركات التأمين إلى الوضوح أكثر من أي وقت.
        </h2>

        <div className="space-y-6 text-lg text-text-muted leading-relaxed">
          <p>
            صون مشروع يركز على تنظيم عمليات مطالبات تأمين المركبات، من خلال ربط
            بيانات الوثيقة بالمطالبة والتعيين والمعاينة الميدانية والمراجعة ضمن
            مسار واحد.
          </p>
          <p>
            هدفنا ليس استبدال الخبرة البشرية أو قرار شركة التأمين، بل بناء
            الأدوات التي تجعل هذه الخبرة تعمل على بيانات منظمة ورحلة واضحة.
          </p>
        </div>
      </div>
    </section>
  );
}
