import { format, parseISO, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export function formatDate(dateString: string, formatStr: string = "dd MMM yyyy"): string {
  try {
    return format(parseISO(dateString), formatStr, { locale: es });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    return format(parseISO(dateString), "dd MMM yyyy HH:mm", { locale: es });
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true, locale: es });
  } catch {
    return dateString;
  }
}

export function formatCurrency(amount: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatNumber(num: number, decimals: number = 2): string {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${formatNumber(value * 100, decimals)}%`;
}

export function formatDeviation(deviation: number): string {
  const sign = deviation >= 0 ? "+" : "";
  return `${sign}${formatCurrency(deviation)}`;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}
