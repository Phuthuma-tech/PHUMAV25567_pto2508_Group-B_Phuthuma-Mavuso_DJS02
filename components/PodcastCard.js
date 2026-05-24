/**
 * @file PodcastCard.js
 * @description Custom Web Component `<podcast-card>` that renders an
 *              encapsulated podcast preview card.
 *
 * Responsibilities:
 * - Accept podcast data via `setPodcast()` property setter
 * - Render cover image, title, season count, genre tags, and last-updated date
 * - Fire a `podcast-selected` custom event on click or keyboard activation
 * - Encapsulate all styles via Shadow DOM
 *
 * @fires podcast-selected - Bubbles and is composed. `event.detail` is the podcast object.
 */

import { GenreService } from "../utils/GenreService.js";
import { DateUtils } from "../utils/DateUtils.js";

// ---------------------------------------------------------------------------
// Shared Shadow DOM template — parsed once, cloned per instance
// ---------------------------------------------------------------------------

/**
 * @type {HTMLTemplateElement}
 * @description Pre-parsed template for the podcast card's Shadow DOM.
 *              Styles mirror the host app's CSS variables and design tokens
 *              so the card looks native inside the grid.
 */
const template = document.createElement("template");
template.innerHTML = /* html */ `
  <style>
    /* ── Reset ──────────────────────────────────────────────── */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    /* ── Host element ───────────────────────────────────────── */
    :host {
      display: block;
      height: 100%;
    }

    /* ── Card shell ─────────────────────────────────────────── */
    .card {
      background: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: transform 0.2s;
      display: flex;
      flex-direction: column;
      height: 100%;
      outline: none;
    }

    .card:hover {
      transform: scale(1.02);
    }

    .card:focus-visible {
      outline: 2px solid #2196f3;
      outline-offset: 2px;
    }

    /* ── Cover image ────────────────────────────────────────── */
    .card img {
      width: 100%;
      border-radius: 6px;
      aspect-ratio: 1 / 1;
      object-fit: cover;
      display: block;
    }

    /* ── Title ──────────────────────────────────────────────── */
    .card h3 {
      margin: 0.5rem 0;
      font-size: 1rem;
      font-weight: 700;
      color: #1a1a1a;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* ── Season count ───────────────────────────────────────── */
    .card p {
      margin: 0;
      font-size: 0.8rem;
      color: var(--grey-text, #666);
    }

    /* ── Genre tags ─────────────────────────────────────────── */
    .tags {
      margin: 0.5rem 0;
      display: flex;
      flex-wrap: wrap;
      gap: 0;
    }

    .tag {
      background: #eee;
      padding: 0.3rem 0.6rem;
      margin-right: 0.5rem;
      margin-top: 0.5rem;
      border-radius: 4px;
      display: inline-block;
      font-size: 0.8rem;
    }

    /* ── Updated date ───────────────────────────────────────── */
    .updated-text {
      font-size: 0.8rem;
      color: var(--grey-text, #666);
      margin-top: auto;
      padding-top: 0.5rem;
    }
  </style>

  <article class="card" role="button" tabindex="0" aria-label="View podcast details">
    <img alt="" loading="lazy" />
    <h3></h3>
    <p class="seasons"></p>
    <div class="tags"></div>
    <p class="updated-text"></p>
  </article>
`;

// ---------------------------------------------------------------------------
// PodcastCard class
// ---------------------------------------------------------------------------

/**
 * @class PodcastCard
 * @extends HTMLElement
 *
 * @description `<podcast-card>` custom element. Renders a podcast preview
 *              card with full Shadow DOM encapsulation.
 *
 * @example
 * const card = document.createElement('podcast-card');
 * card.setPodcast(podcastObject);
 * card.addEventListener('podcast-selected', (e) => openModal(e.detail));
 * document.querySelector('#podcastGrid').appendChild(card);
 */
class PodcastCard extends HTMLElement {
  constructor() {
    super();

    /** @type {ShadowRoot} */
    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));

    /**
     * Cached Shadow DOM element references for efficient re-renders.
     *
     * @type {{ card: HTMLElement, img: HTMLImageElement, title: HTMLElement,
     *          seasons: HTMLElement, tags: HTMLElement, updated: HTMLElement }}
     */
    this.elements = {
      card: shadow.querySelector(".card"),
      img: shadow.querySelector("img"),
      title: shadow.querySelector("h3"),
      seasons: shadow.querySelector(".seasons"),
      tags: shadow.querySelector(".tags"),
      updated: shadow.querySelector(".updated-text"),
    };

    /** @type {Object|null} Internal podcast data store */
    this._podcast = null;

    this._bindEvents();
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Accepts a podcast data object, stores it, and triggers a render.
   * This is the primary way to hydrate the component.
   *
   * @param {Object}   podcast           - The podcast data object.
   * @param {string}   podcast.id        - Unique podcast identifier.
   * @param {string}   podcast.image     - URL for the podcast cover image.
   * @param {string}   podcast.title     - Podcast title.
   * @param {number}   podcast.seasons   - Number of available seasons.
   * @param {number[]} podcast.genres    - Array of genre IDs.
   * @param {string}   podcast.updated   - ISO 8601 last-updated date string.
   * @returns {void}
   */
  setPodcast(podcast) {
    this._podcast = podcast;
    this._render();
  }

  // ── Private methods ───────────────────────────────────────────────────────

  /**
   * Attaches click and keyboard listeners to the card element.
   * Keyboard support covers both Enter and Space for accessibility.
   *
   * @private
   * @returns {void}
   */
  _bindEvents() {
    const { card } = this.elements;

    card.addEventListener("click", () => this._dispatch());

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this._dispatch();
      }
    });
  }

  /**
   * Dispatches the `podcast-selected` custom event with the current podcast
   * as `event.detail`. Uses `bubbles: true` and `composed: true` so the event
   * crosses the Shadow DOM boundary and is catchable by the host application.
   *
   * @private
   * @returns {void}
   */
  _dispatch() {
    if (!this._podcast) return;

    this.dispatchEvent(
      new CustomEvent("podcast-selected", {
        detail: this._podcast,
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Reads `this._podcast` and updates all Shadow DOM elements accordingly.
   * No-ops when `_podcast` is null.
   *
   * @private
   * @returns {void}
   */
  _render() {
    if (!this._podcast) return;

    const { image, title, seasons, genres, updated } = this._podcast;
    const { img, title: titleEl, seasons: seasonsEl, tags, updated: updatedEl, card } = this.elements;

    img.src = image;
    img.alt = `${title} podcast cover`;

    card.setAttribute("aria-label", `View details for ${title}`);

    titleEl.textContent = title;

    seasonsEl.textContent = `${seasons} Season${seasons !== 1 ? "s" : ""}`;

    tags.innerHTML = GenreService.getNames(genres)
      .map((name) => `<span class="tag">${name}</span>`)
      .join("");

    updatedEl.textContent = `Updated: ${DateUtils.format(updated)}`;
  }
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

/**
 * Registers `<podcast-card>` with the Custom Elements registry.
 * The guard prevents double-registration errors when this module
 * is imported more than once (e.g. in hot-reload environments).
 */
if (!customElements.get("podcast-card")) {
  customElements.define("podcast-card", PodcastCard);
}
