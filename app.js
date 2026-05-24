/**
 * @file app.js
 * @description Main application entry point for the Podcast Preview App.
 *
 * Responsibilities:
 * - Import and initialise the grid renderer
 * - Load podcast data
 * - Handle search, sort, and genre filter controls
 * - Coordinate state between UI controls and the rendered grid
 *
 * @module app
 */

import { podcasts, genres } from "./data/data.js";
import { createGrid } from "./components/createGrid.js";

// ── Initialise grid ────────────────────────────────────────────────────────

/** @type {{ render: function(Object[]): void }} */
const grid = createGrid();

// ── DOM references ─────────────────────────────────────────────────────────

/** @type {HTMLInputElement} */
const searchInput = document.getElementById("searchInput");

/** @type {HTMLSelectElement} */
const sortSelect = document.getElementById("sortSelect");

/** @type {HTMLSelectElement} */
const genreSelect = document.getElementById("genreFilter");

// ── Populate genre filter ──────────────────────────────────────────────────

/**
 * Builds the genre `<option>` elements from the genres data array and
 * appends them to the genre filter `<select>`.
 *
 * @returns {void}
 */
function populateGenreFilter() {
  genres.forEach(({ id, title }) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = title;
    genreSelect.appendChild(option);
  });
}

populateGenreFilter();

// ── Filtering & sorting ────────────────────────────────────────────────────

/**
 * Returns a filtered and sorted copy of the podcasts array based on the
 * current values of the search input, sort select, and genre select.
 *
 * @returns {Object[]} Processed list of podcast objects ready to render.
 */
function getFilteredList() {
  const query = searchInput.value.toLowerCase().trim();
  const sortValue = sortSelect.value;
  const genreValue = genreSelect.value;

  let list = [...podcasts];

  // Filter by search query (title match)
  if (query) {
    list = list.filter((p) => p.title.toLowerCase().includes(query));
  }

  // Filter by genre
  if (genreValue) {
    list = list.filter((p) => p.genres.includes(Number(genreValue)));
  }

  // Sort
  switch (sortValue) {
    case "az":
      list.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "za":
      list.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case "newest":
      list.sort((a, b) => new Date(b.updated) - new Date(a.updated));
      break;
    case "oldest":
      list.sort((a, b) => new Date(a.updated) - new Date(b.updated));
      break;
    default:
      break;
  }

  return list;
}

/**
 * Re-renders the grid with the current filtered and sorted podcast list.
 *
 * @returns {void}
 */
function refresh() {
  grid.render(getFilteredList());
}

// ── Event listeners ────────────────────────────────────────────────────────

searchInput.addEventListener("input", refresh);
sortSelect.addEventListener("change", refresh);
genreSelect.addEventListener("change", refresh);

// ── Initial render ─────────────────────────────────────────────────────────

refresh();
