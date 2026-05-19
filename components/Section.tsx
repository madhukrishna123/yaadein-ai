import type { ReactNode } from "react";

export function Section({
  id,
  eyebrow,
  title,
  children
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="px-5 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 max-w-3xl">
          {eyebrow ? (
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-heirloom">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-3xl font-semibold text-[#fff7ea] sm:text-4xl">{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}
