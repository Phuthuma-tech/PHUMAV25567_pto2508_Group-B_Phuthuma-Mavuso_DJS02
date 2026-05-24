# DJS02 – Podcast Preview Web Component

A reusable, encapsulated custom HTML element (`<podcast-card>`) that displays a podcast preview. Built with native Web Components (no frameworks), Shadow DOM, and custom events.

---

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [How to Register the Component](#how-to-register-the-component)
- [How to Pass Data](#how-to-pass-data)
- [How to Listen for Interaction Events](#how-to-listen-for-interaction-events)
- [Component API Reference](#component-api-reference)
- [Design Principles](#design-principles)
- [Running the Demo](#running-the-demo)
- [Browser Compatibility](#browser-compatibility)

---

## Overview

`<podcast-card>` is a self-contained Web Component that renders a podcast preview card including:

- 🖼 Cover image
- 🎙 Podcast title
- 🔢 Number of seasons
- 🏷 Genre tags
- 📅 Last updated date (human-readable)

When a user clicks or keyboard-activates the card, it fires a `podcast-selected` custom event that bubbles up to the host application — keeping the component fully decoupled from application logic.

---

## Project Structure

```
djs02-podcast-preview/
├── components/
│   ├── PodcastCard.js       ← The Web Component (primary deliverable)
│   └── createModal.js       ← Modal controller (IIFE module)
│   └── createGrid.js        ← Grid renderer
├── utils/
│   ├── GenreService.js      ← Resolves genre IDs → names
│   └── DateUtils.js         ← Date formatting helpers
├── demo.html                ← Self-contained showcase page
└── README.md
```

---

## How to Register the Component

Simply import the component file. Registration via `customElements.define()` happens automatically on import.

```html
<!-- In your HTML file -->
<script type="module" src="./components/PodcastCard.js"></script>
```

```js
// Or in a JavaScript/ES module
import './components/PodcastCard.js';
```

> **Guard against double-registration:** The component uses `customElements.get()` to prevent errors when the module is imported more than once (e.g., in hot-reload environments).

Once registered, you can use the element anywhere in your HTML:

```html
<podcast-card></podcast-card>
```

---

## How to Pass Data

The component accepts data via the **`setPodcast(podcast)`** method. This is the primary and recommended way to hydrate the component.

### Method: `setPodcast(podcast)`

| Parameter         | Type       | Description                                      |
|-------------------|------------|--------------------------------------------------|
| `podcast.image`   | `string`   | URL of the podcast cover image                   |
| `podcast.title`   | `string`   | Title of the podcast                             |
| `podcast.genres`  | `number[]` | Array of genre IDs (resolved via `GenreService`) |
| `podcast.seasons` | `number`   | Number of seasons                                |
| `podcast.updated` | `string`   | ISO 8601 date string of the last update          |

### Example

```js
import './components/PodcastCard.js';

const card = document.createElement('podcast-card');

card.setPodcast({
  id: 1,
  title: 'Something Was Wrong',
  image: 'https://example.com/cover.jpg',
  genres: [2, 8],        // Resolved to ["Investigative Journalism", "News"]
  seasons: 11,
  updated: '2024-01-15T00:00:00.000Z',
});

document.querySelector('#podcastGrid').appendChild(card);
```

---

## How to Listen for Interaction Events

When a user clicks (or presses `Enter`/`Space` on) a card, it dispatches a **`podcast-selected`** custom event.

### Event: `podcast-selected`

| Property         | Value                                       |
|------------------|---------------------------------------------|
| `event.type`     | `"podcast-selected"`                        |
| `event.detail`   | The full podcast data object passed via `setPodcast()` |
| `event.bubbles`  | `true` — propagates up the DOM tree         |
| `event.composed` | `true` — crosses the Shadow DOM boundary    |

### Listening on the card element directly

```js
card.addEventListener('podcast-selected', (event) => {
  const podcast = event.detail;
  console.log('User selected:', podcast.title);
  openModal(podcast); // your app's modal logic
});
```

### Listening via event delegation on a parent container

Because the event uses `bubbles: true` and `composed: true`, you can also listen at a higher level:

```js
document.querySelector('#podcastGrid').addEventListener('podcast-selected', (event) => {
  openModal(event.detail);
});
```

---

## Component API Reference

### `<podcast-card>`

```
customElements.define('podcast-card', PodcastCard)
```

| Member                 | Type       | Description                                                              |
|------------------------|------------|--------------------------------------------------------------------------|
| `setPodcast(podcast)`  | `method`   | Sets podcast data and triggers a re-render of the component's Shadow DOM |
| `podcast-selected`     | `event`    | Fired on click or keyboard activation; `event.detail` = podcast object   |

### Internal (private) methods

| Method         | Description                                                                 |
|----------------|-----------------------------------------------------------------------------|
| `_render()`    | Updates Shadow DOM elements from `this._podcast`. No-ops if data is not set |
| `_dispatch()`  | Fires `podcast-selected` with composed + bubbling flags                     |
| `_bindEvents()`| Attaches `click` and `keydown` listeners to the inner card element          |

---

## Design Principles

### Single Responsibility (SRP)
Each module has one job:
- `PodcastCard.js` — renders a single card preview
- `createGrid.js` — manages the grid layout and wires events
- `createModal.js` — controls modal open/close and content
- `GenreService.js` — genre ID resolution only
- `DateUtils.js` — date formatting only

### Open/Closed Principle (OCP)
New card fields (e.g., ratings, play button) can be added to the Shadow DOM template without changing how the component is used externally.

### Encapsulation
Shadow DOM ensures the component's internal styles never leak into or inherit from the global stylesheet, and global styles never bleed in.

### Loose Coupling
The component knows nothing about modals or the rest of the app. It only fires an event. The parent decides what to do.

---

## Running the Demo

No build step required. Open `demo.html` directly in any modern browser:

```bash
# Option 1: open directly
open demo.html

# Option 2: serve locally (recommended for module imports)
npx serve .
# or
python3 -m http.server 8080
```

Then visit `http://localhost:8080/demo.html`.

The demo page includes:
- A live grid of 8 sample podcast cards using `<podcast-card>`
- Search filtering by title
- Sorting (A→Z, Z→A, newest/oldest updated)
- A detail modal that opens on card click (wired via `podcast-selected`)
- Full keyboard navigation support

---

## Browser Compatibility

| Feature          | Chrome | Firefox | Safari | Edge |
|------------------|--------|---------|--------|------|
| Custom Elements  | ✅ 67+ | ✅ 63+  | ✅ 14+ | ✅ 79+ |
| Shadow DOM       | ✅ 53+ | ✅ 63+  | ✅ 14+ | ✅ 79+ |
| ES Modules       | ✅ 61+ | ✅ 60+  | ✅ 11+ | ✅ 16+ |
| Custom Events    | ✅     | ✅      | ✅     | ✅     |
| `aspect-ratio`   | ✅ 88+ | ✅ 89+  | ✅ 15+ | ✅ 88+ |

> All modern browsers are supported. No polyfills are required.

---

## License

MIT — free to use, modify, and distribute.
