const NAV_LINKS = [
  { label: "الرئيسية", href: "#hero" },
  { label: "كيف تعمل", href: "#how-it-works" },
  { label: "الحل", href: "#solution" },
  { label: "المنصة", href: "#platform" },
];

export default function LandingFooter() {
  return (
    <footer className="bg-navy-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src="/logo.jpeg"
                alt="صَوْن"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-xl font-bold text-white">صَوْن</span>
              <p className="text-white/50 text-xs">مطالبات مترابطة.</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} صون — منصة لإدارة مطالبات تأمين
            المركبات
          </p>
        </div>
      </div>
    </footer>
  );
}
