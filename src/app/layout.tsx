// src/app/layout.tsx
import './globals.css';
import { AuthProvider } from './context/AuthProvider';
import { ToasterClient } from '@/components/ui/ToasterClient';
import { ExposeToasts } from '@/components/dev/ExposeToast';


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
   <html lang="es">
      <body>
        <AuthProvider>
          {children}
          <ToasterClient />
          {process.env.NODE_ENV === 'development' && <ExposeToasts />} {/* solo en dev */}
        </AuthProvider>
      </body>
    </html>
  );
}

