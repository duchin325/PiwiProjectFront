// src/components/dev/ExposeToasts.tsx
'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { notify } from '../../app/lib/notify';

export function ExposeToasts() {
  useEffect(() => {
    // @ts-expect-error: solo para debug
    window.sonner = { toast };
    // @ts-expect-error: solo para debug
    window.notify = notify;
  }, []);
  return null;
}
