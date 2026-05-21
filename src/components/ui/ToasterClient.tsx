'use client'

import { Toaster } from 'sonner';

export function ToasterClient() {
  return <Toaster 
            position = "top-right" richColors
            expand = {false}
            visibleToasts = {3}
            closeButton
        />; 
}