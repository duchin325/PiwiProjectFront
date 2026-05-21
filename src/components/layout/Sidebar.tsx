'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/shipments', label: 'Encomiendas' },
  { href: '/clients', label: 'Clientes' },
  { href: '/drivers', label: 'Conductores' },
  { href: '/trips', label: 'Hojas de ruta' },
];

export function Sidebar() {
   const pathname = usePathname() ?? '';
  return (
    <div className="h-dvh p-4">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-xl bg-blue-600" />
        <span className="font-semibold">Piwi Encomiendas</span>
      </div>
      <nav className="space-y-1">
        {links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className={`block px-3 py-2 rounded-xl hover:bg-gray-50 ${
              pathname.startsWith(l.href) ? 'bg-gray-100 font-medium' : ''
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
