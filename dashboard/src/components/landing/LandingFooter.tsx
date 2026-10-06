const NAV_LINKS = [
  { label: "كيف تعمل", href: "#journey" },
  { label: "المنصة", href: "#platform" },
  { label: "لمن؟", href: "#audience" },
  { label: "عن صَوْن", href: "#about" },
];

export default function LandingFooter() {
  return (
    <footer className="bg-navy-800 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg">
              <img
                src="/logo.jpeg"
                alt="صَوْن"
                width={36}
                height={36}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </span>
            <div>
              <span className="text-xl font-bold text-white">صَوْن</span>
              <p className="text-xs text-white/50">مطالبات مترابطة.</p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2" aria-label="روابط الصفحة">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-white/90 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center">
          <p className="text-sm text-white/55">
            © {new Date().getFullYear()} صون — منصة لإدارة مطالبات تأمين
            المركبات
          </p>
        </div>
      </div>
    </footer>
  );
}
