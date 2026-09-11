import type { ExpiryStatus } from "./types";

const SOON_THRESHOLD_DAYS = 14;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Días restantes hasta la caducidad estimada (opened_at + shelf_life_days).
 * Devuelve null si faltan datos para calcularlo — el producto simplemente
 * no participa en el filtro de estado.
 */
export function getDaysUntilExpiry(
  openedAt: string | null,
  shelfLifeDays: number | null,
): number | null {
  if (!openedAt || !shelfLifeDays) return null;
  const opened = new Date(openedAt);
  if (Number.isNaN(opened.getTime())) return null;

  const expiryDate = new Date(opened.getTime() + shelfLifeDays * MS_PER_DAY);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiryDate.setHours(0, 0, 0, 0);

  return Math.round((expiryDate.getTime() - today.getTime()) / MS_PER_DAY);
}

export function getExpiryStatus(
  openedAt: string | null,
  shelfLifeDays: number | null,
): ExpiryStatus | null {
  const days = getDaysUntilExpiry(openedAt, shelfLifeDays);
  if (days === null) return null;
  if (days < 0) return "expired";
  if (days <= SOON_THRESHOLD_DAYS) return "expiring-soon";
  return "active";
}

export function formatExpiryText(
  openedAt: string | null,
  shelfLifeDays: number | null,
): string {
  const days = getDaysUntilExpiry(openedAt, shelfLifeDays);
  if (days === null) return "Sin fecha de apertura";
  if (days < 0) {
    const daysAgo = Math.abs(days);
    return daysAgo === 1 ? "Caducó hace 1 día" : `Caducó hace ${daysAgo} días`;
  }
  if (days === 0) return "Caduca hoy";
  return days === 1 ? "Caduca en 1 día" : `Caduca en ${days} días`;
}
