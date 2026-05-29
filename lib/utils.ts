import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function money(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

export function padNumber(value: number) {
  return String(value).padStart(4, "0");
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function phoneMask(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function whatsappLink(phone: string, message: string) {
  const digits = onlyDigits(phone);
  const normalized = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function shareText(siteUrl: string) {
  return `Participe da Rifa Solidária - Ajude a Amanda a viver sem dor. Com R$ 10,00 você concorre a uma cesta de eletrônicos e ajuda na cirurgia. ${siteUrl}`;
}
