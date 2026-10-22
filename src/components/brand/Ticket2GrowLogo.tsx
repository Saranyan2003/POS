import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark" | "emerald" | "white" | "dualtone-dark" | "dualtone-white";
  showTagline?: boolean;
}

interface GlyphProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark" | "emerald" | "white";
  color?: string;
}

/**
 * Exact Ticket2Grow standalone "2" Upward Growth Glyph
 * Extracted directly from official brand logo
 */
export function Ticket2GrowGlyph({
  className = "",
  size = "md",
  variant = "white",
  color,
}: GlyphProps) {
  const sizeClasses = {
    sm: "h-5 w-auto object-contain",
    md: "h-7 w-auto object-contain",
    lg: "h-9 w-auto object-contain",
    xl: "h-12 w-auto object-contain",
  };

  let src = "/brand/ticket2grow-glyph-white.png";

  if (color === "#ffffff" || variant === "white") {
    src = "/brand/ticket2grow-glyph-white.png";
  } else if (color === "#10b981" || color === "#059669" || variant === "emerald") {
    src = "/brand/ticket2grow-glyph-emerald.png";
  } else if (variant === "dark" || variant === "light" || color === "#0a0a0a" || color === "#090d0b") {
    src = "/brand/ticket2grow-glyph-dark.png";
  }

  const finalClass = className ? `${className} object-contain` : sizeClasses[size];

  return (
    <img
      src={src}
      alt="Ticket2Grow Symbol"
      className={finalClass}
      draggable={false}
    />
  );
}

/**
 * Exact Ticket2Grow Full Brand Logo
 * Rendered using authentic brand typography & upward growth glyph with theme-adapted coloring
 */
export function Ticket2GrowLogo({
  className = "",
  size = "md",
  variant = "dark",
  showTagline = false,
}: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-auto",
    md: "h-8 w-auto",
    lg: "h-10 w-auto",
    xl: "h-12 sm:h-14 w-auto",
  };

  // Select exact themed image based on variant
  let src = "/brand/ticket2grow-logo-dualtone-dark.png";

  if (variant === "white" || variant === "dualtone-white") {
    src = "/brand/ticket2grow-logo-dualtone-white.png";
  } else if (variant === "dark" || variant === "dualtone-dark" || variant === "light") {
    src = "/brand/ticket2grow-logo-dualtone-dark.png";
  } else if (variant === "emerald") {
    src = "/brand/ticket2grow-logo-emerald.png";
  }

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`inline-flex flex-col items-start ${className}`}>
      <img
        src={src}
        alt="Ticket2Grow"
        className={`${currentSizeClass} object-contain select-none`}
        draggable={false}
      />
      {showTagline && (
        <span className="text-[9px] font-bold font-mono tracking-widest uppercase text-emerald-600 mt-1 pl-0.5">
          Cloud POS & SaaS
        </span>
      )}
    </div>
  );
}

export default Ticket2GrowLogo;
