type YaadeinLogoProps = {
  className?: string;
  markClassName?: string;
  showText?: boolean;
  textClassName?: string;
};

export function YaadeinLogo({
  className = "",
  markClassName = "h-9 w-9",
  showText = true,
  textClassName = "text-lg"
}: YaadeinLogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`} aria-label="Yaadein">
      <svg className={markClassName} viewBox="0 0 44 44" role="img" aria-hidden="true">
        <rect x="2" y="2" width="40" height="40" rx="12" fill="#14110f" stroke="#d8b46a" strokeWidth="1.5" />
        <path d="M13.5 15.5h17c1.4 0 2.5 1.1 2.5 2.5v13c0 1.4-1.1 2.5-2.5 2.5h-17A2.5 2.5 0 0 1 11 31V18c0-1.4 1.1-2.5 2.5-2.5Z" fill="#241f19" stroke="#f0d99b" strokeWidth="1.3" />
        <path d="M16 28.2 20.8 23l3.7 3.8 2-2.2 4.1 4.6H16Z" fill="#d8b46a" opacity="0.88" />
        <path d="M15.5 13.1 22 25.8l6.5-12.7" fill="none" stroke="#f6e4b4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.2" />
        <path d="M22 25.4v7" stroke="#f6e4b4" strokeLinecap="round" strokeWidth="3.2" />
        <circle cx="30.5" cy="13.5" r="2.2" fill="#8ad7b5" />
      </svg>
      {showText ? (
        <span className={`font-semibold tracking-[0.02em] text-[#fff7ea] ${textClassName}`}>Yaadein</span>
      ) : null}
    </span>
  );
}
