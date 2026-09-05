// =========================================================
// MUSIC VAULT
// Dynamic Media Library
// media.json → Library Cards → Filters
// =========================================================


// ---------------------------------------------------------
// Global State
// ---------------------------------------------------------

let musicVaultTracks = [];


// ---------------------------------------------------------
// DOM Elements
// ---------------------------------------------------------

const libraryGrid =
  document.querySelector(".library-grid");

const libraryFilters =
  document.querySelectorAll(".library-filter");


// ---------------------------------------------------------
// Load Media JSON
// ---------------------------------------------------------

async function loadMusicLibrary() {

  if (!libraryGrid) {
    return;
  }

  try {

    // Prevent browser cache from keeping old media.json
    const response = await fetch(
      "./media.json?ts=" + Date.now()
    );


    if (!response.ok) {
      throw new Error(
        "media.json could not be loaded."
      );
    }


    const data =
      await response.json();


    musicVaultTracks =
      Array.isArray(data.files)
        ? data.files
        : [];


    // Make tracks available to player.js
    window.musicVaultTracks =
      musicVaultTracks;


    renderMusicLibrary(
      musicVaultTracks
    );


    // Re-apply current filter
    applyLibraryFilter();


    console.log(
      "Music Vault:",
      musicVaultTracks.length,
      "media file(s) loaded."
    );


  } catch (error) {

    console.error(
      "Music Vault Library Error:",
      error
    );


    libraryGrid.innerHTML = `
      <div class="music-library-status">
        <h3>Library Unavailable</h3>
        <p>
          Unable to load media library.
        </p>
      </div>
    `;

  }

}


// ---------------------------------------------------------
// Render Music Library
// ---------------------------------------------------------

function renderMusicLibrary(files) {

  libraryGrid.innerHTML = "";


  if (!files.length) {

    libraryGrid.innerHTML = `
      <div class="music-library-status">
        <h3>No Music Found</h3>
        <p>
          No media files are currently available.
        </p>
      </div>
    `;

    return;
  }


  files.forEach((file, index) => {

    const card =
      createMusicCard(
        file,
        index
      );


    libraryGrid.appendChild(card);

  });


  // Reconnect play buttons
  setupMusicPlayButtons();

}


// ---------------------------------------------------------
// Create Music Card
// ---------------------------------------------------------

function createMusicCard(
  file,
  index
) {

  const article =
    document.createElement("article");


  article.className =
    "music-card";


  article.dataset.index =
    index;


  article.dataset.tags =
    buildCardTags(file);


  // -------------------------------------------------------
  // Basic Metadata
  // -------------------------------------------------------

  const title =
    file.title ||
    cleanFileName(file.fileName);


  const artist =
    file.artist ||
    file.hiResMetadata?.artist ||
    "";


  const subtitle =
    artist
      ? artist
      : "Premium Music Release";


  // -------------------------------------------------------
  // Technical Tags
  // -------------------------------------------------------

  const tags =
    buildTechnicalTags(file);


  // -------------------------------------------------------
  // Cover
  // -------------------------------------------------------

  const coverHTML =
    createCoverHTML(
      file,
      title
    );


  // -------------------------------------------------------
  // Card HTML
  // -------------------------------------------------------

  article.innerHTML = `

    <div class="music-cover">

      ${coverHTML}

      <div class="music-cover-overlay"></div>

      <a
        class="music-play"
        href="#player"
        data-track-index="${index}"
        aria-label="Play ${escapeHTML(title)}">

        ▶

      </a>

    </div>


    <div class="music-info">


      <div class="music-main">

        <h3>
          ${escapeHTML(title)}
        </h3>

        <p>
          ${escapeHTML(subtitle)}
        </p>

      </div>


      <div class="music-tags">

        ${tags}

      </div>


      <div class="music-bottom">

        <span class="music-type">
          Multimedia
        </span>


        <button
          class="music-more"
          type="button"
          aria-label="More options">

          ⋮

        </button>

      </div>


    </div>

  `;


  return article;

}


// ---------------------------------------------------------
// Build Card Filter Tags
// ---------------------------------------------------------

function buildCardTags(file) {

  const tags = [];


  // 1440p
  if (
    file.video &&
    Number(file.video.height) >= 1440
  ) {

    tags.push("1440p");

  }


  // Hi-Res
  if (
    file.audio &&
    file.audio.hiResTrack
  ) {

    tags.push("hires");

  }


  // Multi Audio
  if (
    file.audio &&
    Number(file.audio.trackCount) > 1
  ) {

    tags.push("multi-audio");

  }


  return tags.join(" ");

}


// ---------------------------------------------------------
// Build Technical Metadata Tags
// ---------------------------------------------------------

function buildTechnicalTags(file) {

  const tags = [];


  // Video Resolution
  if (file.video?.resolution) {

    const height =
      Number(file.video.height || 0);


    if (height >= 1440) {

      tags.push(
        `<span>1440p</span>`
      );

    } else if (height >= 1080) {

      tags.push(
        `<span>1080p</span>`
      );

    } else if (height >= 720) {

      tags.push(
        `<span>720p</span>`
      );

    } else {

      tags.push(
        `<span>${escapeHTML(file.video.resolution)}</span>`
      );

    }

  }


  // Video Codec
  if (file.video?.codec) {

    tags.push(
      `<span>${escapeHTML(
        file.video.codec.toUpperCase()
      )}</span>`
    );

  }


  // Hi-Res Audio
  const hiResTrack =
    getHiResTrack(file);


  if (hiResTrack) {

    const codec =
      hiResTrack.codec
        ? hiResTrack.codec.toUpperCase()
        : "HI-RES";


    tags.push(
      `<span>Hi-Res ${escapeHTML(codec)}</span>`
    );

  }


  // Multi Audio
  if (
    file.audio &&
    Number(file.audio.trackCount) > 1
  ) {

    tags.push(
      `<span>Multi Audio</span>`
    );

  }


  return tags.join("\n");

}


// ---------------------------------------------------------
// Find Hi-Res Track
// ---------------------------------------------------------

function getHiResTrack(file) {

  if (
    !file.audio ||
    !Array.isArray(file.audio.tracks)
  ) {

    return null;

  }


  // Prefer scanner-detected Hi-Res track
  if (file.audio.hiResTrack) {

    const track =
      file.audio.tracks.find(
        item =>
          Number(item.index) ===
          Number(file.audio.hiResTrack)
      );


    if (track) {
      return track;
    }

  }


  // Fallback: ALAC / FLAC / WAV
  return file.audio.tracks.find(
    track => {

      const codec =
        String(track.codec || "")
          .toLowerCase();


      return (
        codec === "alac" ||
        codec === "flac" ||
        codec === "wav"
      );

    }
  ) || null;

}


// ---------------------------------------------------------
// Create Cover
// ---------------------------------------------------------

function createCoverHTML(
  file,
  title
) {

  /*
   * media.json may later contain:
   *
   * cover: "cover.jpg"
   *
   * Until then, use the premium fallback cover.
   */

  if (file.cover) {

    return `
      <img
        class="music-cover-image"
        src="${escapeHTML(file.cover)}"
        alt="${escapeHTML(title)}"
        loading="lazy"
        onerror="this.style.display='none';">
    `;

  }


  return `
    <div class="music-cover-glow"></div>

    <span class="music-cover-title">
      MUSIC
    </span>
  `;

}


// ---------------------------------------------------------
// Music Play Buttons
// ---------------------------------------------------------

function setupMusicPlayButtons() {

  const playButtons =
    document.querySelectorAll(
      ".music-play"
    );


  playButtons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        (event) => {

          event.preventDefault();


          const index =
            Number(
              button.dataset.trackIndex
            );


          if (
            window.musicVaultTracks &&
            window.musicVaultTracks[index]
          ) {

            const track =
              window.musicVaultTracks[index];


            // Give player.js the selected track
            window.dispatchEvent(
              new CustomEvent(
                "musicvault:play",
                {
                  detail: {
                    track,
                    index
                  }
                }
              )
            );

          }


          // Scroll to player
          const player =
            document.querySelector("#player");


          if (player) {

            player.scrollIntoView({
              behavior: "smooth",
              block: "start"
            });

          }

        }
      );

    }
  );

}


// ---------------------------------------------------------
// Library Filters
// ---------------------------------------------------------

let currentFilter = "all";


libraryFilters.forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        // Active button
        libraryFilters.forEach(
          (item) => {
            item.classList.remove(
              "active"
            );
          }
        );


        button.classList.add(
          "active"
        );


        // Selected filter
        currentFilter =
          button.dataset.filter ||
          "all";


        applyLibraryFilter();

      }
    );

  }
);


// ---------------------------------------------------------
// Apply Library Filter
// ---------------------------------------------------------

function applyLibraryFilter() {

  const musicCards =
    document.querySelectorAll(
      ".music-card"
    );


  musicCards.forEach(
    (card) => {

      const cardTags =
        card.dataset.tags || "";


      if (
        currentFilter === "all"
      ) {

        card.style.display = "";

        return;

      }


      const tags =
        cardTags.split(" ");


      if (
        tags.includes(currentFilter)
      ) {

        card.style.display = "";

      } else {

        card.style.display = "none";

      }

    }
  );

}


// ---------------------------------------------------------
// Clean Filename
// ---------------------------------------------------------

function cleanFileName(
  fileName = ""
) {

  return fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/\s*\[[^\]]*\]/g, "")
    .trim();

}


// ---------------------------------------------------------
// Escape HTML
// ---------------------------------------------------------

function escapeHTML(value = "") {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


// ---------------------------------------------------------
// Start Music Vault
// ---------------------------------------------------------

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadMusicLibrary();

  }
);
