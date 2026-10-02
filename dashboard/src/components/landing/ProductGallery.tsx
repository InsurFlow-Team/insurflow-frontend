const SCREENSHOTS = [
  {
    title: "لوحة المطالبات",
    caption: "متابعة المطالبات من مكان واحد.",
    image: "/screenshots/gallery-dashboard.png",
  },
  {
    title: "خريطة التوزيع",
    caption: "دعم قرار تعيين المعاين.",
    image: "/screenshots/gallery-map.png",
  },
  {
    title: "تفاصيل المطالبة",
    caption: "ملف واحد يجمع بيانات المطالبة ورحلتها.",
    image: "/screenshots/gallery-details.png",
  },
  {
    title: "المعاينة الميدانية",
    caption: "توثيق العمل من الهاتف.",
    image: "/screenshots/gallery-mobile.png",
    mobile: true,
  },
];

export default function ProductGallery() {
  return (
    <section className="py-20 lg:py-28 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy-700 leading-tight mb-6">
            شاهد صَوْن أثناء العمل
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-8">
          {SCREENSHOTS.map((shot) => (
            <div key={shot.title} className="group">
              <div
                className={`mb-4 overflow-hidden rounded-xl border border-border bg-background shadow-sm ${shot.mobile ? "flex items-center justify-center h-[360px]" : ""}`}
              >
                <img
                  src={shot.image}
                  alt={shot.title}
                  className={`transition-transform duration-300 group-hover:scale-[1.02] ${shot.mobile ? "h-full w-auto max-w-full object-contain" : "h-auto w-full object-cover"}`}
                />
              </div>
              <h3 className="text-lg font-bold text-text mb-1">{shot.title}</h3>
              <p className="text-sm text-text-muted">{shot.caption}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
