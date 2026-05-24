/**
 * @namespace DateUtils
 * @description Utility functions for formatting date strings throughout the app.
 */
export const DateUtils = {
  /**
   * Formats an ISO 8601 date string into a human-readable localised date.
   *
   * @param {string} isoString - An ISO 8601 date string (e.g. "2022-11-03T07:00:00.000Z").
   * @returns {string} A formatted date string (e.g. "3 Nov 2022").
   *
   * @example
   * DateUtils.format("2022-11-03T07:00:00.000Z"); // → "3 Nov 2022"
   */
  format(isoString) {
    return new Date(isoString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  },
};
