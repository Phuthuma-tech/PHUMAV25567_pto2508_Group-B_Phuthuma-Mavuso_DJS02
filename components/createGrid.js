/**
 * @file createGrid.js
 * @description Grid Renderer — creates and renders `<podcast-card>` elements
 *              into the podcast grid container, and wires the `podcast-selected`
 *              event to the modal controller.
 *
 * @principle SRP - Manages layout and card rendering only; delegates card
 *                  creation to `PodcastCard` and modal logic to `createModal`.
 */

import "../components/PodcastCard.js";
import { createModal } from "../components/createModal.js";

/**
 * Factory function that returns a grid renderer bound to the `#podcastGrid`
 * container element.
 *
 * @returns {{ render: function(Object[]): void }} Grid controller object.
 *
 * @example
 * const grid = createGrid();
 * grid.render(podcastArray);
 */
export const createGrid = () => {
  /** @type {HTMLElement} The grid container element */
  const container = document.getElementById("podcastGrid");

  return {
    /**
     * Clears the grid and renders a new list of podcast cards.
     * Each card is a `<podcast-card>` custom element. On selection,
     * the modal opens with the corresponding podcast data.
     *
     * @param {Object[]} podcastList - Array of podcast data objects to display.
     * @returns {void}
     */
    render(podcastList) {
      container.innerHTML = "";

      if (podcastList.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <p>No podcasts found. Try adjusting your search or filters.</p>
          </div>`;
        return;
      }

      podcastList.forEach((podcast) => {
        /** @type {HTMLElement & { setPodcast: function }} */
        const card = document.createElement("podcast-card");
        card.setAttribute("role", "listitem");
        card.setPodcast(podcast);

        card.addEventListener("podcast-selected", (e) => {
          createModal.open(e.detail);
        });

        container.appendChild(card);
      });
    },
  };
};
