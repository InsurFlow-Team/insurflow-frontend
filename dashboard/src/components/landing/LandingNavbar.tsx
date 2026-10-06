import { useEffect, useState } from "react";
import { ArrowLeft, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "كيف تعمل", href: "#journey" },
  { label: "المنصة", href: "#platform" },
  { label: "لمن؟", href: "#audience" },
  { label: "عن صَوْن", href: "#about" },
];

export default function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 motion-reduce:transition-none ${
        stuck
          ? "border-border bg-surface/85 shadow-[0_1px_2px_rgba(15,22,50,0.04)] backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <a href="#hero" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg">
              <img
                src="/logo.jpeg"
                alt="صَوْن"
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            </span>
            <span className="text-lg font-black text-navy-700 sm:text-xl">
              صَوْن <span className="text-text-subtle font-bold">| SAWN</span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 md:flex" aria-label="التنقل الرئيسي">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-text-soft transition-colors hover:text-primary"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:block">
            <a href="#demo" className="landing-btn-primary text-sm">
              احجز عرضًا توضيحيًا
            </a>
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-lg p-2 text-text-soft transition-colors hover:text-primary md:hidden"
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-surface md:hidden">
          <nav className="space-y-1 px-4 py-4" aria-label="قائمة الجوال">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-text-soft transition-colors hover:bg-surface-soft hover:text-primary"
              >
                {link.label}
              </a>
            ))}
            <div className="border-t border-border pt-3">
              <a
                href="#demo"
                onClick={() => setOpen(false)}
                className="landing-btn-primary block w-full py-2.5 text-sm"
              >
                احجز عرضًا توضيحيًا
                <ArrowLeft size={16} />
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
