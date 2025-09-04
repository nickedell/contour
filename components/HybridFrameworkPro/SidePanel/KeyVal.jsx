export default function KeyVal({ k, v }) {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 w-40 text-neutral-400 uppercase tracking-widest text-[10px]">{k}</div>
      <div className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">{Array.isArray(v)?v.join(', '):v}</div>
    </div>
  );
}