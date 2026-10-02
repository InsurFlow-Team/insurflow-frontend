const SCREENSHOTS = [
  {
    title: "لوحة المعلومات",
    caption: "مراقبة المطالبات من مكان واحد.",
    image: "/screenshots/gallery-dashboard.png",
  },
  {
    title: "خريطة التوزيع",
    caption: "دعم قرارات ذكية بالمعاينة.",
    image: "/screenshots/gallery-map.png",
  },
  {
    title: "تفاصيل المطالبة",
    caption: "ملف واضح يشمل بيانات المطالبة ورصدها.",
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
            شاهد صون بسهولة العمل
          </h2>
        </div>

        {/* First row: 2 images side by side */}
        <div className="grid sm:grid-cols-2 gap-6 mb-6">
          {SCREENSHOTS.slice(0, 2).map((shot) => (
            <div key={shot.title} className="group">
              <div className="mb-3 overflow-hidden rounded-xl border border-border bg-background shadow-sm">
                <img
                  src={shot.image}
                  alt={shot.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>
              <h3 className="text-lg font-bold text-text mb-1">{shot.title}</h3>
              <p className="text-sm text-text-muted">{shot.caption}</p>
            </div>
          ))}
        </div>

        {/* Second row: 2 images side by side */}
        <div className="grid sm:grid-cols-2 gap-6">
          {SCREENSHOTS.slice(2).map((shot) => (
            <div key={shot.title} className="group">
              <div
                className={`mb-3 overflow-hidden rounded-xl border border-border bg-background shadow-sm ${
                  shot.mobile ? "flex items-center justify-center p-4" : ""
                }`}
              >
                <img
                  src={shot.image}
                  alt={shot.title}
                  className={`transition-transform duration-300 group-hover:scale-[1.02] ${
                    shot.mobile
                      ? "h-auto max-h-[400px] w-auto max-w-full object-contain"
                      : "h-full w-full object-cover"
                  }`}
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
