/**
 * @file createModal.js
 * @description Modal Controller — manages the podcast detail modal's open/close
 *              state and populates it with data from the selected podcast.
 *
 * @principle SRP  - Handles only modal visibility and content updates.
 * @principle OCP  - New fields (ratings, episode player) can be added without
 *                   changing the public `open` / `close` interface.
 */

import { GenreService } from "../utils/GenreService.js";
import { DateUtils } from "../utils/DateUtils.js";
import { seasons } from "../data/data.js";

/**
 * @namespace createModal
 * @description IIFE-based singleton that controls the podcast detail modal.
 *
 * @example
 * import { createModal } from './components/createModal.js';
 * createModal.open(podcastObject); // populate and show
 * createModal.close();             // hide
 */
export const createModal = (() => {
  /**
   * Helper to retrieve a DOM element by ID.
   * @param {string} id - The element's `id` attribute.
   * @returns {HTMLElement}
   */
  const el = (id) => document.getElementById(id);

  /** @type {HTMLElement} The modal wrapper element */
  const modal = el("modal");

  /** @type {HTMLElement} The semi-transparent overlay behind the modal */
  const overlay = el("modalOverlay");

  // ── Internal helpers ────────────────────────────────────────────────────

  /**
   * Populates every field inside the modal with data from the given podcast.
   *
   * @private
   * @param {Object}   podcast           - Podcast data object.
   * @param {string}   podcast.id        - Podcast ID used to look up seasons.
   * @param {string}   podcast.image     - Cover image URL.
   * @param {string}   podcast.title     - Podcast title.
   * @param {string}   podcast.description - Full description text.
   * @param {number[]} podcast.genres    - Array of genre IDs.
   * @param {string}   podcast.updated   - ISO 8601 last-updated date.
   * @returns {void}
   */
  function updateContent(podcast) {
    el("modalImage").src = podcast.image;
    el("modalImage").alt = `${podcast.title} cover image`;
    el("modalTitle").textContent = podcast.title;
    el("modalDesc").textContent = podcast.description;

    el("modalGenres").innerHTML = GenreService.getNames(podcast.genres)
      .map((g) => `<span class="tag">${g}</span>`)
      .join("");

    el("modalUpdated").textContent = `Last updated: ${DateUtils.format(podcast.updated)}`;

    // Season list — look up by matching podcast ID in the seasons array
    const seasonData =
      seasons.find((s) => s.id === podcast.id)?.seasonDetails || [];

    el("seasonList").innerHTML = seasonData
      .map(
        (s, index) => `
        <li class="season-item">
          <strong class="season-title">Season ${index + 1}: ${s.title}</strong>
          <span class="episodes">${s.episodes} episode${s.episodes !== 1 ? "s" : ""}</span>
        </li>`
      )
      .join("");
  }

  // ── Event wiring ────────────────────────────────────────────────────────

  /** Close on overlay backdrop click */
  overlay?.addEventListener("click", (e) => {
    if (e.target === overlay) module.close();
  });

  /** Close on Escape key */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") module.close();
  });

  /** Close button inside the modal */
  el("modalClose")?.addEventListener("click", () => module.close());

  // ── Public API ──────────────────────────────────────────────────────────

  const module = {
    /**
     * Fills the modal with podcast data and makes it visible.
     *
     * @param {Object} podcast - The podcast object to display.
     * @returns {void}
     */
    open(podcast) {
      updateContent(podcast);
      modal.classList.remove("hidden");
      overlay?.classList.remove("hidden");
      el("modalClose")?.focus();
    },

    /**
     * Hides the modal and overlay without clearing their content.
     *
     * @returns {void}
     */
    close() {
      modal.classList.add("hidden");
      overlay?.classList.add("hidden");
    },
  };

  return module;
})();
