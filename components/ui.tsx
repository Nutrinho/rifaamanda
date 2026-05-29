"use client";

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  const variants = {
    primary: "bg-wine-700 text-white hover:bg-wine-800 shadow-soft",
    secondary: "border border-wine-200 bg-white text-wine-800 hover:bg-wine-50",
    ghost: "text-wine-800 hover:bg-wine-50",
    danger: "bg-red-600 text-white hover:bg-red-700"
  };
  return (
    <button
      className={cn(
        "focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-wine-100 bg-white p-4 shadow-soft", className)} {...props} />;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "focus-ring h-11 w-full rounded-lg border border-wine-100 bg-white px-3 text-sm text-rosewood placeholder:text-wine-300",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "focus-ring min-h-28 w-full rounded-lg border border-wine-100 bg-white px-3 py-2 text-sm text-rosewood placeholder:text-wine-300",
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1 block text-sm font-bold text-wine-900", className)} {...props} />;
}

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full bg-wine-50 px-2.5 py-1 text-xs font-bold text-wine-800", className)}
      {...props}
    />
  );
}

export function Progress({ value }: { value: number }) {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-wine-100">
      <div className="h-full rounded-full bg-gradient-to-r from-wine-700 to-gold transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-wine-200 bg-white/70 p-8 text-center">
      <p className="font-bold text-wine-900">{title}</p>
      <p className="mt-1 text-sm text-wine-700">{text}</p>
    </div>
  );
}
