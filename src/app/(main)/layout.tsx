// src/app/(main)/layout.tsx
import '@/app/globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh grid grid-cols-1 md:grid-cols-[260px_1fr]">
      <aside className="hidden md:block border-r bg-white">
        <Sidebar />
      </aside>
      <main>
        <Topbar />
        <div className="container-page">{children}</div>
      </main>
    </div>
  );
}
