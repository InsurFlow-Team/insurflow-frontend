import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const backToTop = () => {
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div
      className={`fixed bottom-6 end-6 z-40 transition-all duration-300 motion-reduce:transition-none ${
        visible
          ? "visible translate-y-0 opacity-100"
          : "invisible translate-y-4 opacity-0"
      }`}
    >
      <button
        type="button"
        onClick={backToTop}
        aria-label="العودة إلى أعلى الصفحة"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-[0_10px_30px_-12px_rgba(15,22,50,0.55)] transition-colors hover:bg-primary-dark"
      >
        <ArrowUp size={20} aria-hidden="true" />
      </button>
    </div>
  );
}