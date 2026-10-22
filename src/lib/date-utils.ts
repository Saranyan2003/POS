/**
 * Universal Date Range Utility for Ticket2Grow
 * Standardizes date boundary calculation for start (00:00:00.000) and end (23:59:59.999) of days
 */

export interface DateRangeBoundaries {
  startDate: Date;
  endDate: Date;
  label: string;
}

export function parseDateRange(
  rangePreset?: string | null,
  customStart?: string | null,
  customEnd?: string | null
): { startDate?: Date; endDate?: Date; label: string } {
  const now = new Date();

  // If custom start or end date is provided
  if (customStart || customEnd || rangePreset === "custom") {
    let start: Date | undefined;
    let end: Date | undefined;

    if (customStart) {
      const parts = customStart.split("-").map(Number);
      if (parts.length === 3) {
        start = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
      } else {
        start = new Date(customStart);
        start.setHours(0, 0, 0, 0);
      }
    }

    if (customEnd) {
      const parts = customEnd.split("-").map(Number);
      if (parts.length === 3) {
        end = new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59, 999);
      } else {
        end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
      }
    }

    const label =
      customStart && customEnd
        ? `${customStart} to ${customEnd}`
        : customStart
        ? `From ${customStart}`
        : customEnd
        ? `Until ${customEnd}`
        : "Custom Date Range";

    return { startDate: start, endDate: end, label };
  }

  // Presets
  switch (rangePreset) {
    case "today": {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      return { startDate: start, endDate: end, label: "Today's Shift" };
    }
    case "yesterday": {
      const y = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const start = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 0, 0, 0, 0);
      const end = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23, 59, 59, 999);
      return { startDate: start, endDate: end, label: "Yesterday" };
    }
    case "week": {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      return { startDate: start, endDate: end, label: "Past 7 Days" };
    }
    case "month":
    case "this_month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      return { startDate: start, endDate: end, label: "Current Month" };
    }
    case "last_month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { startDate: start, endDate: end, label: "Last Month" };
    }
    case "year":
    case "this_year": {
      const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      return { startDate: start, endDate: end, label: "Year to Date" };
    }
    case "all":
      return { label: "All Time" };
    default: {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      return { startDate: start, endDate: end, label: "Current Month" };
    }
  }
}

/**
 * Format a Date into YYYY-MM-DD input string
 */
export function formatDateInput(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
