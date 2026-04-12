import type { InputHTMLAttributes } from 'react';
import { designSystem } from '../../designSystem';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full ${designSystem.borderRadius} border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none backdrop-blur-sm ${designSystem.transitions} focus:border-primary focus:ring-2 focus:ring-primary/30`}
    />
  );
}
