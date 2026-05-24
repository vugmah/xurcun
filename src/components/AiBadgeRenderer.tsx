/* ═══════════════════════════════════════════════════════════════════
   AI BADGE RENDERER — Displays human-approved AI badges
   ═══════════════════════════════════════════════════════════════════

   Usage: <AiBadgeRenderer itemId={item.id} branchSlug="white-city" />

   Fetches approved badges from DB and renders them alongside
   static badges (isNew, isSpicy, etc).

   9 badge types: isNew, isSpicy, isSnack, isPopular, isRecommended,
   isStaffPick, isChefSpecial, isBestseller, isSeasonal
   ═══════════════════════════════════════════════════════════════════ */

import { trpc } from "@/providers/trpc";
import {
  Flame, Star, Award, ThumbsUp, Heart, ChefHat, Crown,
  Sparkles, Leaf,
} from "lucide-react";

const BADGE_CONFIG: Record<string, { icon: typeof Flame; label: string; color: string; bg: string }> = {
  isNew: { icon: Sparkles, label: "NEW", color: "#22c55e", bg: "#22c55e15" },
  isSpicy: { icon: Flame, label: "SPICY", color: "#ef4444", bg: "#ef444415" },
  isSnack: { icon: Star, label: "SNACK", color: "#f59e0b", bg: "#f59e0b15" },
  isPopular: { icon: ThumbsUp, label: "POPULAR", color: "#3b82f6", bg: "#3b82f615" },
  isRecommended: { icon: Heart, label: "RECOMMENDED", color: "#ec4899", bg: "#ec489915" },
  isStaffPick: { icon: Award, label: "STAFF PICK", color: "#8b5cf6", bg: "#8b5cf615" },
  isChefSpecial: { icon: ChefHat, label: "CHEF SPECIAL", color: "#C9A96E", bg: "#C9A96E15" },
  isBestseller: { icon: Crown, label: "BESTSELLER", color: "#f59e0b", bg: "#f59e0b15" },
  isSeasonal: { icon: Leaf, label: "SEASONAL", color: "#22c55e", bg: "#22c55e15" },
};

interface AiBadgeRendererProps {
  itemId: number;
  branchSlug?: string;
  variant?: "inline" | "below";
}

export default function AiBadgeRenderer({ itemId, branchSlug = "white-city", variant = "inline" }: AiBadgeRendererProps) {
  const { data: badges } = trpc.badges.getPublic.useQuery(
    { branchSlug },
    { staleTime: 5 * 60 * 1000 } // 5 min cache
  );

  const itemBadges = badges?.filter((b) => b.itemId === itemId) || [];

  if (itemBadges.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1 ${variant === "below" ? "mt-1" : ""}`}>
      {itemBadges.map((badge) => {
        const config = BADGE_CONFIG[badge.badgeType];
        if (!config) return null;
        const Icon = config.icon;
        return (
          <span
            key={badge.id}
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold border"
            style={{
              color: config.color,
              background: config.bg,
              borderColor: `${config.color}30`,
            }}
            title={badge.aiReason || config.label}
          >
            <Icon className="w-2.5 h-2.5" />
            {config.label}
          </span>
        );
      })}
    </div>
  );
}

/** Combined badge row: static + AI badges */
export function CombinedBadges({
  itemId,
  branchSlug = "white-city",
  variant = "inline",
  children, // static badges from MenuBadges
}: {
  itemId: number;
  branchSlug?: string;
  variant?: "inline" | "below";
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {children}
      <AiBadgeRenderer itemId={itemId} branchSlug={branchSlug} variant={variant} />
    </div>
  );
}
