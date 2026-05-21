'use client';
import { toast } from 'sonner';

export const notify = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast(message),
  promise: <T>(
    promise: Promise<T>,
    messages?: { loading?: string; success?: string; error?: string }
  ) => {
    toast.promise(promise, {
      loading: messages?.loading ?? 'Procesando...',
      success: messages?.success ?? 'Listo',
      error: messages?.error ?? 'Ups, fallo',
    });

    return promise;
  },
};
