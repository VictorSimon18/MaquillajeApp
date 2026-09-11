import {
  Briefcase,
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
import type { ExpiryStatus, Occasion, ProductCategory } from "./types";

export const CATEGORY_META: Record<
  ProductCategory,
  { label: string; icon: LucideIcon }
> = {
  labial: { label: "Labial", icon: Heart },
  base: { label: "Base", icon: Droplet },
  corrector: { label: "Corrector", icon: Wand2 },
  rimel: { label: "Rímel", icon: Eye },
  sombra: { label: "Sombra", icon: Layers },
  delineador: { label: "Delineador", icon: PenLine },
  rubor: { label: "Rubor", icon: Sparkles },
  polvo: { label: "Polvos", icon: Sparkles },
  bronceador: { label: "Bronceador", icon: Sun },
  primer: { label: "Primer", icon: Shield },
};

export const OCCASION_META: Record<
  Occasion,
  { label: string; icon: LucideIcon }
> = {
  diario: { label: "Diario", icon: Sun },
  trabajo: { label: "Trabajo", icon: Briefcase },
  noche: { label: "Noche", icon: Moon },
  evento: { label: "Evento especial", icon: PartyPopper },
  finde: { label: "Fin de semana", icon: Sparkles },
};

export const EXPIRY_STATUS_META: Record<
  ExpiryStatus,
  { label: string; color: string; soft: string }
> = {
  active: { label: "Activo", color: "var(--color-mint)", soft: "var(--color-mint-soft)" },
  "expiring-soon": {
    label: "Caduca pronto",
    color: "var(--color-amber)",
    soft: "var(--color-amber-soft)",
  },
  expired: { label: "Caducado", color: "var(--color-coral)", soft: "var(--color-coral-soft)" },
};
