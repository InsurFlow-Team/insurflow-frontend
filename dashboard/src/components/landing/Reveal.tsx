import {
  type CSSProperties,
  type ElementType,
  type ReactNode,
  useRef,
} from "react";

import { useInView } from "./useInView";

type RevealProps = {
  children: ReactNode;
  as?: "div" | "li" | "section" | "figure" | "span" | "p" | "h1" | "h2" | "h3" | "a" | "ul";
  className?: string;
  delay?: number;
  variant?: "up" | "scale";
};

/**
 * One-shot scroll reveal. The element animates the first time it enters the
 * viewport and stays put afterwards.
 */
export default function Reveal({
  children,
  as = "div",
  className = "",
  delay = 0,
  variant = "up",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref);

  const Tag = as as ElementType;

  return (
    <Tag
      ref={ref}
      className={[
        "landing-reveal",
        variant === "scale" ? "landing-reveal--scale" : "",
        inView ? "is-visible" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
