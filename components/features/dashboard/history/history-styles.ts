// ─── Shared Tailwind class constants for the History feature (Red/Blue Theme) ──

// ── Page layout ──────────────────────────────────────────────────────────────

export const PAGE_WRAPPER = "flex-1 w-full min-h-screen bg-white mx-auto max-w-[1920px] shadow-[0_10px_50px_rgba(0,0,0,0.04)]";

export const PAGE_HEADER =
    "bg-white border-b border-gray-100 px-8 md:px-10 py-6 rounded-t-[24px]";

export const PAGE_HEADER_INNER =
    "mx-auto flex items-center justify-between";

export const PAGE_CONTENT = "px-8 md:px-10 py-8 mx-auto rounded-b-[24px]";


export const HDFC_RED = "#E31837";
export const HDFC_BLUE = "#004C8F"; // Standardized HDFC Blue

export const SUCCESS_GREEN = "#10b981"; // Emerald-500
export const DESTRUCTIVE_RED = "#f43f5e"; // Rose-500 (Softer than the previous dark red)
export const NEUTRAL_BLUE = "#004C8F";


// ── Dropdown Buttons ────────────────────────────────────────────────────────

export const FILTER_BTN_BASE =
    "flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-all";

export const FILTER_BTN_ACTIVE =
    "border-gray-200 text-[#004C8F]";

export const CLEAR_BTN =
    `px-4 py-2 text-xs font-semibold text-[${DESTRUCTIVE_RED}] border border-[${DESTRUCTIVE_RED}]/20 rounded-lg hover:bg-[${DESTRUCTIVE_RED}]/5 transition-all`;

// ── Dropdown Menu ───────────────────────────────────────────────────────────

export const DROPDOWN_MENU =
    "absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-150";

export const DROPDOWN_ITEM =
    "w-full text-left px-5 py-2.5 text-sm transition-colors";

export const DROPDOWN_ITEM_ACTIVE =
    "text-black font-bold bg-[#004C8F]/5";

export const DROPDOWN_ITEM_INACTIVE =
    "text-gray-600 hover:bg-gray-50 hover:text-gray-800";

// ── History Card ─────────────────────────────────────────────────────────────

export const CARD_CONTAINER =
    "bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-blue-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group text-left w-full block cursor-pointer";

// ── Pagination ───────────────────────────────────────────────────────────────

export const PAG_BTN =
    "w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all";

export const PAG_NUM_BASE =
    "w-9 h-9 rounded-lg text-sm font-semibold transition-all";

export const PAG_NUM_ACTIVE = "bg-[#004C8F] text-white";
export const PAG_NUM_INACTIVE = "text-gray-600 hover:bg-gray-100";
