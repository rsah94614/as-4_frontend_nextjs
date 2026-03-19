// ─── Shared Tailwind class constants for the Redeem feature ──────────────────
// Import only the constants you need in each component.
// This eliminates repetition and makes theme changes a single-file edit.

// ── Page layout ──────────────────────────────────────────────────────────────

export const PAGE_WRAPPER = "flex-1 w-full";

export const PAGE_CARD =
    "shadow-none border-none bg-white mx-auto py-0";

export const PAGE_CONTENT = "px-8 md:px-10 py-10";

export const PRODUCT_GRID =
    "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5";

export const SECTION_HEADER = "flex items-center justify-between mb-5";

// ── Gradients ────────────────────────────────────────────────────────────────

export const GRADIENT_PRIMARY =
    "bg-[#004C8F] border-r border-white/10";

export const GRADIENT_PRIMARY_HOVER =
    "hover:bg-[#004C8F] hover:border-r hover:border-white/10";

export const GRADIENT_SECONDARY =
    "bg-[#004C8F] border-r border-white/10";

// ── Category pills ───────────────────────────────────────────────────────────

export const CATEGORY_WRAP = "flex gap-2 flex-wrap mb-8";

export const PILL_BASE =
    "rounded-full px-4 py-1.5 text-sm font-medium transition-all";

export const PILL_ACTIVE =
    `${GRADIENT_PRIMARY} text-white shadow-sm ${GRADIENT_PRIMARY_HOVER}`;

export const PILL_INACTIVE =
    "bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent";

// ── Pagination ───────────────────────────────────────────────────────────────

export const PAG_BTN_BASE =
    "rounded-lg px-3 py-1.5 text-sm font-bold text-slate-800 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed";

export const PAG_NUM_BASE =
    "rounded-lg min-w-[36px] px-2 py-1.5 text-sm font-medium transition-all";

export const PAG_NUM_ACTIVE =
    "bg-[#004C8F] text-white shadow-sm hover:bg-[#003d73]";

export const PAG_NUM_INACTIVE =
    "text-slate-800 font-bold hover:bg-slate-100 border-slate-200";

// ── Reward card ──────────────────────────────────────────────────────────────

export const CARD_CONTAINER =
    "group relative rounded-xl border border-slate-300 bg-white flex flex-col overflow-hidden transition-all duration-300 shadow-md shadow-slate-400";

export const CARD_ENABLED =
    "cursor-pointer hover:shadow-xl hover:shadow-slate-300 hover:-translate-y-0.5";

export const CARD_DISABLED = "opacity-60 cursor-not-allowed border-slate-100";

export const CARD_BODY = "flex flex-col flex-1 p-5";

export const ICON_BOX = "w-11 h-11 rounded-2xl flex items-center justify-center";

// ── Dialog ───────────────────────────────────────────────────────────────────

export const INFO_PANEL =
    "rounded-2xl bg-slate-50 border border-slate-100 p-4";

export const DIALOG_PADDING = "px-7";

export const CENTER_COLUMN =
    "flex flex-col items-center text-center px-7 py-10";

export const STATUS_ICON_WRAP =
    "w-16 h-16 rounded-full flex items-center justify-center mb-5";

// ── Animations ───────────────────────────────────────────────────────────────

export const ANIMATE_FADE_IN_UP = "animate-fade-in-up";

export const ANIMATE_SHIMMER = "animate-shimmer";

export const ANIMATE_SCALE_IN = "animate-scale-in";

export const ANIMATE_PULSE_GLOW = "animate-pulse-glow";

export const ANIMATE_CHECK_BOUNCE = "animate-check-bounce";

export const ANIMATE_COUNT_IN = "animate-count-in";

export const ANIMATE_SPARKLE = "animate-sparkle";

export const ANIMATE_FADE_IN = "animate-fade-in";

export const ANIMATE_SLIDE_DOWN = "animate-slide-down";

/** Returns the stagger class for a given index (0-based, wraps at 8) */
export function staggerClass(index: number): string {
    return `stagger-${Math.min(index + 1, 8)}`;
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

export const SHIMMER_BOX = "rounded-xl animate-shimmer";

export const SHIMMER_CIRCLE = "rounded-full animate-shimmer";

export const SKELETON_CARD =
    "rounded-lg border border-slate-200 p-4 space-y-3 animate-fade-in";
