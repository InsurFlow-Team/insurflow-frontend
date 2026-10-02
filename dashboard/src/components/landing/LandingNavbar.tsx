import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "الرئيسية", href: "#hero" },
  { label: "كيف تعمل", href: "#how-it-works" },
  { label: "الحل", href: "#solution" },
  { label: "المنصة", href: "#platform" },
  { label: "تواصل معنا", href: "#contact" },
];

export default function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <a href="#hero" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src="/logo.jpeg"
                alt="صَوْن"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xl font-bold text-primary">صَوْن | SAWN</span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-text-muted hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <a
              href="#demo"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold px-5 py-2.5 text-sm transition-colors"
              style={{ color: "white" }}
            >
              شاهد العرض التجريبي
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-text-muted hover:text-text rounded-lg"
            aria-label={isOpen ? "إغلاق القائمة" : "فتح القائمة"}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-surface">
          <nav className="px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:bg-surface-soft hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-border">
              <a
                href="#demo"
                onClick={() => setIsOpen(false)}
                className="block text-center rounded-lg bg-primary hover:bg-primary-dark text-white font-bold px-5 py-2.5 text-sm transition-colors"
              >
                شاهد العرض التجريبي
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
