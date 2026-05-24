import { genres } from "../data/data.js";

/**
 * @namespace GenreService
 * @description Utility service for resolving genre IDs to human-readable names.
 * Reads from the shared genres data array — no local caches or side effects.
 */
export const GenreService = {
  /**
   * Converts an array of numeric genre IDs into their corresponding title strings.
   * IDs that do not match any known genre are silently omitted.
   *
   * @param {number[]} ids - Array of genre IDs (e.g. [1, 3]).
   * @returns {string[]} Array of human-readable genre names (e.g. ["Personal Growth", "History"]).
   *
   * @example
   * GenreService.getNames([1, 2]); // → ["Personal Growth", "Investigative Journalism"]
   */
  getNames(ids = []) {
    return ids
      .map((id) => genres.find((g) => g.id === id)?.title)
      .filter(Boolean);
  },
};
