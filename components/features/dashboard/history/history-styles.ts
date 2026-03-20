// ─── Shared Tailwind class constants for the History feature (Red/Blue Theme) ──

// ── Page layout ──────────────────────────────────────────────────────────────

export const PAGE_WRAPPER =
    "flex-1 w-full min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_45%,#ffffff_100%)] mx-auto shadow-[0_10px_50px_rgba(15,23,42,0.05)]";

export const PAGE_HEADER =
    "border-b border-slate-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(0,76,143,0.08),_transparent_32%),linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-6 md:px-10 py-7 rounded-t-[24px]";

export const PAGE_HEADER_INNER =
    "mx-auto flex flex-col gap-5 md:flex-row md:items-center md:justify-between";

export const PAGE_CONTENT = "px-6 md:px-10 py-8 md:py-10 mx-auto rounded-b-[24px]";


export const HDFC_RED = "#E31837";
export const HDFC_BLUE = "#004C8F"; // Standardized HDFC Blue

export const SUCCESS_GREEN = "#10b981"; // Emerald-500
export const DESTRUCTIVE_RED = "#f43f5e"; // Rose-500 (Softer than the previous dark red)
export const NEUTRAL_BLUE = "#004C8F";


// ── Dropdown Buttons ────────────────────────────────────────────────────────

export const FILTER_BTN_BASE =
    "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-[0_6px_18px_rgba(15,23,42,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004C8F]/20";

export const FILTER_BTN_ACTIVE =
    "border-[#004C8F]/20 bg-[#004C8F]/5 text-[#004C8F]";

export const CLEAR_BTN =
    "inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition-all duration-200 hover:border-[#004C8F]/20 hover:bg-[#004C8F]/5 hover:text-[#004C8F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004C8F]/20";

// ── Dropdown Menu ───────────────────────────────────────────────────────────

export const DROPDOWN_MENU =
    "absolute top-full left-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200/80 bg-white py-1 shadow-[0_18px_50px_rgba(15,23,42,0.14)] z-20 animate-in fade-in zoom-in-95 duration-150";

export const DROPDOWN_ITEM =
    "w-full text-left px-5 py-2.5 text-sm transition-colors";

export const DROPDOWN_ITEM_ACTIVE =
    "bg-[#004C8F]/5 text-[#003867] font-semibold";

export const DROPDOWN_ITEM_INACTIVE =
    "text-gray-600 hover:bg-gray-50 hover:text-gray-800";

// ── History Card ─────────────────────────────────────────────────────────────

export const CARD_CONTAINER =
    "group relative block w-full cursor-pointer overflow-hidden rounded-[22px] border border-slate-200/80 bg-white text-left shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#004C8F]/20 hover:shadow-[0_20px_45px_rgba(15,23,42,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004C8F]/20";

// ── Pagination ───────────────────────────────────────────────────────────────

export const PAG_BTN =
    "h-10 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all";

export const PAG_NUM_BASE =
    "w-10 h-10 rounded-full text-sm font-medium transition-all";

export const PAG_NUM_ACTIVE = "bg-[#004C8F] text-white";
export const PAG_NUM_INACTIVE = "text-slate-600 hover:bg-slate-100";
