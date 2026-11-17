import type { ReactNode } from 'react';

export function TableToolbar({ children, refresh }: { children: ReactNode; refresh?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-end">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        {children}
      </div>
      {refresh ? <div className="lg:ml-auto">{refresh}</div> : null}
    </div>
  );
}
