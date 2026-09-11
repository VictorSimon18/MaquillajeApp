import {
  Briefcase,
  Dumbbell,
  Droplet,
  Eye,
  Heart,
  Layers,
  Moon,
  PartyPopper,
  PenLine,
  Shield,
  Sparkles,
  Sun,
  Wand2,
  type LucideIcon,
} from "lucide-react";

const CATEGORY_ICON_BY_NAME: Record<string, LucideIcon> = {
  "rímel": Eye,
  "base de maquillaje": Droplet,
  "labial": Heart,
  "sombra de ojos": Layers,
  "delineador": PenLine,
  "rubor": Sparkles,
  "corrector": Wand2,
  "iluminador": Sparkles,
  "prebase": Shield,
};

const OCCASION_ICON_BY_NAME: Record<string, LucideIcon> = {
  "diario": Sun,
  "trabajo": Briefcase,
  "noche": Moon,
  "evento especial": PartyPopper,
  "deporte": Dumbbell,
};

const DEFAULT_CATEGORY_ICON = Sparkles;
const DEFAULT_OCCASION_ICON = Sparkles;

function normalize(name: string) {
  return name.trim().toLowerCase();
}

/** Icono conocido para categorías predefinidas; genérico para las custom. */
export function getCategoryIcon(name: string): LucideIcon {
  return CATEGORY_ICON_BY_NAME[normalize(name)] ?? DEFAULT_CATEGORY_ICON;
}

/** Icono conocido para ocasiones predefinidas; genérico para las custom. */
export function getOccasionIcon(name: string): LucideIcon {
  return OCCASION_ICON_BY_NAME[normalize(name)] ?? DEFAULT_OCCASION_ICON;
}

export const EXPIRY_STATUS_META = {
  active: { label: "Activo", color: "var(--color-mint)", soft: "var(--color-mint-soft)" },
  "expiring-soon": {
    label: "Caduca pronto",
    color: "var(--color-amber)",
    soft: "var(--color-amber-soft)",
  },
  expired: { label: "Caducado", color: "var(--color-coral)", soft: "var(--color-coral-soft)" },
} as const;
