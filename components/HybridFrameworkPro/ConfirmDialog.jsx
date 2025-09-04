export default function ConfirmDialog({ open, onCancel, onConfirm, title='Confirm', body='Are you sure?' }) {
  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none opacity-0'} transition-opacity`}>
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-2xl">
          <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 text-sm font-semibold">{title}</div>
          <div className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">{body}</div>
          <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-2">
            <button onClick={onCancel} className="px-3 py-1.5 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900">Cancel</button>
            <button onClick={onConfirm} className="px-3 py-1.5 text-sm rounded-md bg-rose-600 text-white">Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}
