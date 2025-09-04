export default function Section({ title, dotClass, children }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        <span className={`inline-block h-2 w-2 rounded-full ${dotClass}`} />
        <h4 className="uppercase tracking-widest text-[11px] font-bold text-neutral-700 dark:text-neutral-300">{title}</h4>
      </div>
      <div className="grid grid-cols-1 gap-1 text-sm text-neutral-700 dark:text-neutral-300">{children}</div>
    </section>
  );
}