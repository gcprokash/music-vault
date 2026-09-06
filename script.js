/* =========================================================
   MUSIC VAULT — MAIN SCRIPT
   Premium Music Details Popup
   ========================================================= */

(() => {
  "use strict";

  const libraryGrid = document.getElementById("library-grid");
  const filterButtons = document.querySelectorAll(".filter-btn");

  let allTracks = [];
  let activeFilter = "all";


  /* =========================================================
     BASIC HELPERS
     ========================================================= */

  function escapeHTML(value) {
    if (value === null || value === undefined) return "";

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  function cleanFileName(name) {
    if (!name) return "Unknown";

    return String(name)
      .replace(/\.[^/.]+$/, "")
      .replace(/\[[^\]]*\]/g, "")
      .replace(/\([^)]*\)/g, "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }


  function formatBytes(bytes) {
    if (!bytes || isNaN(bytes)) return "";

    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = Number(bytes);
    let unit = 0;

    while (size >= 1024 && unit < units.length - 1) {
      size /= 1024;
      unit++;
    }

    return `${size.toFixed(unit === 0 ? 0 : 2)} ${units[unit]}`;
  }


  function formatDuration(seconds) {
    if (seconds === null || seconds === undefined || isNaN(seconds)) {
      return "";
    }

    seconds = Math.round(Number(seconds));

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) {
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }

    return `${m}:${String(s).padStart(2, "0")}`;
  }


  function formatNumber(value) {
    if (value === null || value === undefined || value === "") {
      return "";
    }

    return Number(value).toLocaleString();
  }


  /* =========================================================
     COVER
     ========================================================= */

  function getCoverURL(file) {
    if (!file) return "";

    let cover = file.cover || file.coverUrl || "";

    if (!cover) return "";

    cover = String(cover).trim();

    if (
      cover.startsWith("http://") ||
      cover.startsWith("https://") ||
      cover.startsWith("data:")
    ) {
      return cover;
    }

    cover = cover.replace(/^\.?\//, "");

    return "./" + cover;
  }


  function createFallbackCover(file, title) {
    const artist =
      file?.artist ||
      file?.hiResMetadata?.artist ||
      "";

    return `
      <div class="music-cover-fallback">
        <div class="music-cover-fallback-glow"></div>
        <div class="music-cover-fallback-inner">
          <span class="music-cover-fallback-label">MUSIC VAULT</span>
          <strong>${escapeHTML(title || "MUSIC")}</strong>
          ${
            artist
              ? `<small>${escapeHTML(artist)}</small>`
              : ""
          }
        </div>
      </div>
    `;
  }


  function createCoverHTML(file, title) {
    const cover = getCoverURL(file);

    if (!cover) {
      return createFallbackCover(file, title);
    }

    return `
      <img
        class="music-cover-image"
        src="${escapeHTML(cover)}"
        alt="${escapeHTML(title || "Music")}"
        loading="lazy"
        decoding="async"
        onerror="handleCoverError(this);"
      >
    `;
  }


  window.handleCoverError = function (img) {
    if (!img) return;

    const parent = img.parentElement;

    if (!parent) return;

    const title =
      img.getAttribute("alt") ||
      "MUSIC";

    const fallback = document.createElement("div");

    fallback.className = "music-cover-fallback";

    fallback.innerHTML = `
      <div class="music-cover-fallback-glow"></div>
      <div class="music-cover-fallback-inner">
        <span class="music-cover-fallback-label">MUSIC VAULT</span>
        <strong>${escapeHTML(title)}</strong>
      </div>
    `;

    img.replaceWith(fallback);
  };


  /* =========================================================
     VIDEO DOWNLOAD
     ========================================================= */

  function getVideoDownloadURL(file) {
    if (!file) return "";

    if (file.downloadUrl) {
      return file.downloadUrl;
    }

    if (file.id) {
      return (
        "https://drive.google.com/uc?export=download&id=" +
        encodeURIComponent(file.id)
      );
    }

    if (file.driveUrl) {
      const match = String(file.driveUrl).match(/\/d\/([^/]+)/);

      if (match && match[1]) {
        return (
          "https://drive.google.com/uc?export=download&id=" +
          encodeURIComponent(match[1])
        );
      }
    }

    return "";
  }


  /* =========================================================
     FILTER
     ========================================================= */

  function matchesFilter(file) {
    if (activeFilter === "all") {
      return true;
    }

    const tags = [];

    if (Array.isArray(file.tags)) {
      tags.push(...file.tags);
    }

    if (file.type) {
      tags.push(file.type);
    }

    if (file.video?.codec) {
      tags.push(file.video.codec);
    }

    if (file.audioPlaybackCodec) {
      tags.push(file.audioPlaybackCodec);
    }

    return tags.some(tag =>
      String(tag)
        .toLowerCase()
        .includes(activeFilter.toLowerCase())
    );
  }


  /* =========================================================
     CARD
     ========================================================= */

  function createMusicCard(file, index) {
    const title =
      file.title ||
      cleanFileName(file.fileName) ||
      "Unknown Track";

    const artist =
      file.artist ||
      file.hiResMetadata?.artist ||
      "";

    const album =
      file.album ||
      file.hiResMetadata?.album ||
      "";

    const coverHTML = createCoverHTML(file, title);

    const codec =
      file.video?.codec ||
      file.audioPlaybackCodec ||
      "";

    const resolution =
      file.video?.resolution ||
      file.resolution ||
      "";

    const audioCount =
      Array.isArray(file.audioTracks)
        ? file.audioTracks.length
        : Array.isArray(file.audio)
        ? file.audio.length
        : 0;

    const subtitleCount =
      Array.isArray(file.subtitles)
        ? file.subtitles.length
        : 0;

    const downloadURL = getVideoDownloadURL(file);

    const article = document.createElement("article");

    article.className = "music-card";

    article.dataset.index = String(index);

    article.innerHTML = `
      <div class="music-cover" data-details-index="${index}">
        ${coverHTML}

        <button
          class="music-play"
          type="button"
          data-play-index="${index}"
          aria-label="Play ${escapeHTML(title)}"
        >
          ▶
        </button>
      </div>

      <div class="music-info">

        <div class="music-main">

          <h3
            class="music-card-title"
            data-details-index="${index}"
            title="View details"
          >
            ${escapeHTML(title)}
          </h3>

          ${
            artist
              ? `<p class="music-card-artist">${escapeHTML(artist)}</p>`
              : ""
          }

          ${
            album
              ? `<p class="music-card-album">${escapeHTML(album)}</p>`
              : ""
          }

          <div class="music-tags">

            ${
              resolution
                ? `<span>${escapeHTML(resolution)}</span>`
                : ""
            }

            ${
              codec
                ? `<span>${escapeHTML(codec)}</span>`
                : ""
            }

            ${
              audioCount
                ? `<span>${audioCount} Audio</span>`
                : ""
            }

            ${
              subtitleCount
                ? `<span>${subtitleCount} Subs</span>`
                : ""
            }

            <span>Multimedia</span>

          </div>

        </div>

        <div class="music-actions">

          ${
            downloadURL
              ? `
                <a
                  class="music-download"
                  href="${escapeHTML(downloadURL)}"
                  target="_blank"
                  rel="noopener"
                  download
                  title="Download Video"
                >
                  Download
                </a>
              `
              : ""
          }

          <button
            class="music-more"
            type="button"
            data-details-index="${index}"
            aria-label="View details"
          >
            ⋮
          </button>

        </div>

      </div>
    `;

    return article;
  }


  /* =========================================================
     RENDER LIBRARY
     ========================================================= */

  function renderMusicLibrary() {
    if (!libraryGrid) {
      console.warn("Music Vault: #library-grid not found.");
      return;
    }

    libraryGrid.innerHTML = "";

    const filteredTracks = allTracks.filter(matchesFilter);

    if (!filteredTracks.length) {
      libraryGrid.innerHTML = `
        <div class="music-empty-state">
          <div class="music-empty-icon">♫</div>
          <h3>No music found</h3>
          <p>No tracks match the current filter.</p>
        </div>
      `;

      return;
    }

    filteredTracks.forEach((file) => {
      const originalIndex = allTracks.indexOf(file);

      libraryGrid.appendChild(
        createMusicCard(file, originalIndex)
      );
    });

    setupMusicPlayButtons();
    setupMusicDetailsButtons();
  }


  /* =========================================================
     PLAY BUTTON
     ========================================================= */

  function setupMusicPlayButtons() {
    const buttons =
      document.querySelectorAll("[data-play-index]");

    buttons.forEach(button => {
      button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();

        const index =
          Number(button.dataset.playIndex);

        const track = allTracks[index];

        if (!track) return;

        document.dispatchEvent(
          new CustomEvent("musicvault:play", {
            detail: {
              track,
              index
            }
          })
        );

        const player =
          document.getElementById("player");

        if (player) {
          setTimeout(() => {
            player.scrollIntoView({
              behavior: "smooth",
              block: "center"
            });
          }, 50);
        }
      });
    });
  }


  /* =========================================================
     DETAILS CLICK
     ========================================================= */

  function setupMusicDetailsButtons() {
    const elements =
      document.querySelectorAll("[data-details-index]");

    elements.forEach(element => {
      element.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();

        const index =
          Number(element.dataset.detailsIndex);

        const track = allTracks[index];

        if (!track) return;

        openMusicDetails(track, index);
      });
    });
  }


  /* =========================================================
     FILTER BUTTONS
     ========================================================= */

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      filterButtons.forEach(btn =>
        btn.classList.remove("active")
      );

      button.classList.add("active");

      activeFilter =
        button.dataset.filter ||
        button.textContent.trim() ||
        "all";

      renderMusicLibrary();
    });
  });


  /* =========================================================
     POPUP CSS
     ========================================================= */

  function injectDetailsStyles() {
    if (document.getElementById("music-details-styles")) {
      return;
    }

    const style = document.createElement("style");

    style.id = "music-details-styles";

    style.textContent = `
      /* ===============================================
         MUSIC DETAILS MODAL
         =============================================== */

      .music-details-modal {
        position: fixed;
        inset: 0;
        z-index: 999999;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background:
          radial-gradient(
            circle at 50% 20%,
            rgba(124, 58, 237, 0.20),
            transparent 40%
          ),
          rgba(4, 3, 15, 0.82);
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
      }

      .music-details-modal.open {
        display: flex;
        animation: musicModalFadeIn 0.22s ease;
      }

      @keyframes musicModalFadeIn {
        from {
          opacity: 0;
        }

        to {
          opacity: 1;
        }
      }

      .music-details-box {
        position: relative;
        width: min(1100px, 100%);
        max-height: min(900px, 92vh);
        overflow: hidden;
        display: flex;
        flex-direction: column;

        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 28px;

        background:
          linear-gradient(
            145deg,
            rgba(25, 20, 58, 0.98),
            rgba(10, 8, 28, 0.98)
          );

        box-shadow:
          0 40px 100px rgba(0,0,0,0.65),
          0 0 80px rgba(124,58,237,0.16);

        animation: musicModalScale 0.25s ease;
      }

      @keyframes musicModalScale {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.97);
        }

        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .music-details-close {
        position: absolute;
        top: 16px;
        right: 16px;
        z-index: 20;

        width: 44px;
        height: 44px;

        border: 1px solid rgba(255,255,255,0.14);
        border-radius: 50%;

        background: rgba(0,0,0,0.32);
        color: #fff;

        font-size: 27px;
        line-height: 1;

        cursor: pointer;

        transition:
          transform 0.2s ease,
          background 0.2s ease;
      }

      .music-details-close:hover {
        transform: rotate(90deg);
        background: rgba(124,58,237,0.5);
      }

      .music-details-scroll {
        overflow-y: auto;
        padding: 34px;
      }

      .music-details-hero {
        display: grid;
        grid-template-columns: 300px minmax(0,1fr);
        gap: 32px;
        align-items: center;
        margin-bottom: 30px;
      }

      .music-details-cover {
        width: 100%;
        aspect-ratio: 1 / 1;
        overflow: hidden;
        border-radius: 22px;

        background:
          linear-gradient(
            145deg,
            rgba(124,58,237,0.35),
            rgba(20,15,45,0.9)
          );

        border: 1px solid rgba(255,255,255,0.12);

        box-shadow:
          0 20px 60px rgba(0,0,0,0.45),
          0 0 50px rgba(124,58,237,0.16);
      }

      .music-details-cover img {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
      }

      .music-details-cover .music-cover-fallback {
        width: 100%;
        height: 100%;
      }

      .music-details-heading {
        min-width: 0;
      }

      .music-details-kicker {
        display: inline-flex;
        align-items: center;
        gap: 7px;

        margin-bottom: 10px;

        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;

        opacity: 0.7;
      }

      .music-details-heading h2 {
        margin: 0 0 10px;

        font-size: clamp(26px, 4vw, 46px);
        line-height: 1.08;

        word-break: break-word;
      }

      .music-details-heading .details-artist {
        margin: 0 0 5px;

        font-size: 18px;
        font-weight: 600;

        opacity: 0.9;
      }

      .music-details-heading .details-album {
        margin: 0;

        font-size: 14px;
        opacity: 0.65;
      }

      .music-details-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 24px;
      }

      .music-details-action {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;

        min-height: 44px;
        padding: 0 18px;

        border-radius: 12px;

        border: 1px solid rgba(255,255,255,0.12);

        background: rgba(255,255,255,0.06);
        color: inherit;

        text-decoration: none;
        font-size: 14px;
        font-weight: 700;

        cursor: pointer;

        transition:
          transform 0.2s ease,
          background 0.2s ease;
      }

      .music-details-action:hover {
        transform: translateY(-2px);
        background: rgba(124,58,237,0.28);
      }

      .music-details-action.primary {
        background:
          linear-gradient(
            135deg,
            rgba(124,58,237,0.95),
            rgba(99,102,241,0.95)
          );

        border-color: rgba(255,255,255,0.16);
      }

      .music-details-section {
        margin-top: 26px;
        padding: 22px;

        border: 1px solid rgba(255,255,255,0.09);
        border-radius: 18px;

        background: rgba(255,255,255,0.035);
      }

      .music-details-section h3 {
        margin: 0 0 16px;

        font-size: 16px;
        letter-spacing: 0.02em;
      }

      .music-details-grid {
        display: grid;
        grid-template-columns:
          repeat(auto-fit, minmax(190px, 1fr));
        gap: 10px;
      }

      .music-detail-item {
        min-width: 0;
        padding: 12px 14px;

        border-radius: 12px;

        background: rgba(0,0,0,0.18);
        border: 1px solid rgba(255,255,255,0.055);
      }

      .music-detail-label {
        display: block;

        margin-bottom: 4px;

        font-size: 10px;
        font-weight: 700;

        letter-spacing: 0.1em;
        text-transform: uppercase;

        opacity: 0.52;
      }

      .music-detail-value {
        display: block;

        font-size: 13px;
        line-height: 1.45;

        word-break: break-word;
      }

      .music-track-list {
        display: grid;
        gap: 10px;
      }

      .music-track-item {
        padding: 15px;

        border-radius: 14px;

        background: rgba(0,0,0,0.18);
        border: 1px solid rgba(255,255,255,0.06);
      }

      .music-track-top {
        display: flex;
        justify-content: space-between;
        gap: 15px;
        margin-bottom: 9px;
      }

      .music-track-number {
        font-size: 12px;
        font-weight: 800;
        opacity: 0.65;
      }

      .music-track-title {
        font-size: 14px;
        font-weight: 700;
      }

      .music-track-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
      }

      .music-track-meta span {
        display: inline-flex;

        padding: 5px 8px;

        border-radius: 7px;

        background: rgba(255,255,255,0.055);

        font-size: 11px;
        opacity: 0.78;
      }

      .music-details-raw {
        white-space: pre-wrap;
        word-break: break-word;

        padding: 15px;

        border-radius: 12px;

        background: rgba(0,0,0,0.22);

        font-family:
          ui-monospace,
          SFMono-Regular,
          Menlo,
          Monaco,
          Consolas,
          monospace;

        font-size: 11px;
        line-height: 1.55;

        opacity: 0.75;
      }

      .music-card-title,
      .music-card [data-details-index] {
        cursor: pointer;
      }

      .music-cover[data-details-index] {
        cursor: pointer;
      }

      .music-cover .music-play {
        cursor: pointer;
      }

      .music-empty-state {
        width: 100%;
        padding: 60px 20px;
        text-align: center;
        opacity: 0.7;
      }

      .music-empty-icon {
        font-size: 42px;
        margin-bottom: 10px;
      }

      /* MOBILE */

      @media (max-width: 720px) {
        .music-details-modal {
          padding: 10px;
          align-items: flex-end;
        }

        .music-details-box {
          max-height: 94vh;
          border-radius: 22px 22px 0 0;
        }

        .music-details-scroll {
          padding: 22px 17px 28px;
        }

        .music-details-hero {
          grid-template-columns: 1fr;
          gap: 20px;
        }

        .music-details-cover {
          width: min(270px, 78vw);
          margin: 0 auto;
        }

        .music-details-heading {
          text-align: center;
        }

        .music-details-actions {
          justify-content: center;
        }

        .music-details-section {
          padding: 16px;
        }

        .music-details-close {
          width: 40px;
          height: 40px;
        }
      }
    `;

    document.head.appendChild(style);
  }


  /* =========================================================
     POPUP DOM
     ========================================================= */

  function ensureDetailsModal() {
    let modal =
      document.getElementById("music-details-modal");

    if (modal) {
      return modal;
    }

    injectDetailsStyles();

    modal = document.createElement("div");

    modal.id = "music-details-modal";

    modal.className = "music-details-modal";

    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Music Details");

    modal.innerHTML = `
      <div class="music-details-box">

        <button
          type="button"
          class="music-details-close"
          aria-label="Close details"
        >
          ×
        </button>

        <div class="music-details-scroll">
          <div id="music-details-content"></div>
        </div>

      </div>
    `;

    document.body.appendChild(modal);

    const closeButton =
      modal.querySelector(".music-details-close");

    closeButton.addEventListener(
      "click",
      closeMusicDetails
    );

    modal.addEventListener("click", event => {
      if (event.target === modal) {
        closeMusicDetails();
      }
    });

    document.addEventListener("keydown", event => {
      if (
        event.key === "Escape" &&
        modal.classList.contains("open")
      ) {
        closeMusicDetails();
      }
    });

    return modal;
  }


  /* =========================================================
     DETAIL VALUE
     ========================================================= */

  function detailItem(label, value) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "";
    }

    return `
      <div class="music-detail-item">
        <span class="music-detail-label">
          ${escapeHTML(label)}
        </span>

        <span class="music-detail-value">
          ${escapeHTML(value)}
        </span>
      </div>
    `;
  }


  /* =========================================================
     AUDIO TRACKS
     ========================================================= */

  function getAudioTracks(file) {
    if (Array.isArray(file?.audioTracks)) {
      return file.audioTracks;
    }

    if (Array.isArray(file?.audio)) {
      return file.audio;
    }

    return [];
  }


  function renderAudioTracks(file) {
    const tracks = getAudioTracks(file);

    if (!tracks.length) {
      return `
        <div class="music-details-section">
          <h3>Audio Tracks</h3>
          <div class="music-details-grid">
            ${detailItem("Status", "No audio track metadata")}
          </div>
        </div>
      `;
    }

    return `
      <div class="music-details-section">
        <h3>Audio Tracks (${tracks.length})</h3>

        <div class="music-track-list">

          ${tracks.map((track, index) => {

            const title =
              track.title ||
              track.name ||
              "";

            const language =
              track.language ||
              track.lang ||
              "";

            const codec =
              track.codec ||
              track.codec_name ||
              "";

            const sampleRate =
              track.sampleRate ||
              track.sample_rate
                ? (
                    Number(
                      track.sampleRate ||
                      track.sample_rate
                    ).toLocaleString() + " Hz"
                  )
                : "";

            const bitDepth =
              track.bitDepth ||
              track.bits_per_sample ||
              track.bitsPerSample ||
              "";

            const channels =
              track.channels ||
              track.channelLayout ||
              track.channel_layout ||
              "";

            const bitrate =
              track.bitrate
                ? `${formatNumber(track.bitrate)} bps`
                : "";

            const hiRes =
              track.hiRes === true ||
              track.isHiRes === true ||
              track.hiRes === "true";

            return `
              <div class="music-track-item">

                <div class="music-track-top">

                  <div>
                    <div class="music-track-number">
                      TRACK ${index + 1}
                    </div>

                    ${
                      title
                        ? `
                          <div class="music-track-title">
                            ${escapeHTML(title)}
                          </div>
                        `
                        : ""
                    }
                  </div>

                  ${
                    hiRes
                      ? `
                        <span class="music-track-number">
                          HI-RES
                        </span>
                      `
                      : ""
                  }

                </div>

                <div class="music-track-meta">

                  ${
                    codec
                      ? `<span>Codec: ${escapeHTML(codec)}</span>`
                      : ""
                  }

                  ${
                    language
                      ? `<span>Language: ${escapeHTML(language)}</span>`
                      : ""
                  }

                  ${
                    sampleRate
                      ? `<span>${escapeHTML(sampleRate)}</span>`
                      : ""
                  }

                  ${
                    bitDepth
                      ? `<span>${escapeHTML(bitDepth)} bit</span>`
                      : ""
                  }

                  ${
                    channels
                      ? `<span>${escapeHTML(channels)}</span>`
                      : ""
                  }

                  ${
                    bitrate
                      ? `<span>${escapeHTML(bitrate)}</span>`
                      : ""
                  }

                </div>

              </div>
            `;
          }).join("")}

        </div>
      </div>
    `;
  }


  /* =========================================================
     SUBTITLE TRACKS
     ========================================================= */

  function renderSubtitleTracks(file) {
    const subtitles =
      Array.isArray(file?.subtitles)
        ? file.subtitles
        : [];

    if (!subtitles.length) {
      return `
        <div class="music-details-section">
          <h3>Subtitle Tracks</h3>

          <div class="music-details-grid">
            ${detailItem("Status", "No subtitle tracks")}
          </div>
        </div>
      `;
    }

    return `
      <div class="music-details-section">

        <h3>
          Subtitle Tracks (${subtitles.length})
        </h3>

        <div class="music-track-list">

          ${subtitles.map((sub, index) => {

            const language =
              sub.language ||
              sub.lang ||
              "";

            const title =
              sub.title ||
              "";

            const codec =
              sub.codec ||
              sub.codec_name ||
              "";

            return `
              <div class="music-track-item">

                <div class="music-track-top">

                  <div>
                    <div class="music-track-number">
                      SUBTITLE ${index + 1}
                    </div>

                    ${
                      title
                        ? `
                          <div class="music-track-title">
                            ${escapeHTML(title)}
                          </div>
                        `
                        : ""
                    }
                  </div>

                </div>

                <div class="music-track-meta">

                  ${
                    language
                      ? `
                        <span>
                          Language:
                          ${escapeHTML(language)}
                        </span>
                      `
                      : ""
                  }

                  ${
                    codec
                      ? `
                        <span>
                          Codec:
                          ${escapeHTML(codec)}
                        </span>
                      `
                      : ""
                  }

                </div>

              </div>
            `;
          }).join("")}

        </div>

      </div>
    `;
  }


  /* =========================================================
     POPUP CONTENT
     ========================================================= */

  function buildDetailsHTML(file, index) {
    const title =
      file.title ||
      cleanFileName(file.fileName) ||
      "Unknown Track";

    const artist =
      file.artist ||
      file.hiResMetadata?.artist ||
      "";

    const album =
      file.album ||
      file.hiResMetadata?.album ||
      "";

    const composer =
      file.composer ||
      file.hiResMetadata?.composer ||
      "";

    const cover =
      getCoverURL(file);

    const duration =
      file.duration ||
      file.video?.duration ||
      file.audio?.duration ||
      "";

    const fileSize =
      file.size ||
      file.fileSize ||
      "";

    const downloadURL =
      getVideoDownloadURL(file);

    const video =
      file.video || {};

    const audioTracks =
      getAudioTracks(file);

    const subtitles =
      Array.isArray(file.subtitles)
        ? file.subtitles
        : [];

    const playbackAvailable =
      file.audioPlaybackAvailable === true;

    const coverHTML = cover
      ? `
        <img
          src="${escapeHTML(cover)}"
          alt="${escapeHTML(title)}"
          onerror="this.style.display='none';"
        >
      `
      : createFallbackCover(file, title);

    return `
      <div class="music-details-hero">

        <div class="music-details-cover">
          ${coverHTML}
        </div>

        <div class="music-details-heading">

          <div class="music-details-kicker">
            ♫ MUSIC VAULT
          </div>

          <h2>
            ${escapeHTML(title)}
          </h2>

          ${
            artist
              ? `
                <p class="details-artist">
                  ${escapeHTML(artist)}
                </p>
              `
              : ""
          }

          ${
            album
              ? `
                <p class="details-album">
                  ${escapeHTML(album)}
                </p>
              `
              : ""
          }

          <div class="music-details-actions">

            ${
              playbackAvailable ||
              file.audioPlaybackUrl ||
              file.playbackUrl ||
              file.audioUrl
                ? `
                  <button
                    type="button"
                    class="music-details-action primary"
                    id="details-play-audio"
                    data-play-index="${index}"
                  >
                    ▶ Play Audio
                  </button>
                `
                : ""
            }

            ${
              downloadURL
                ? `
                  <a
                    class="music-details-action"
                    href="${escapeHTML(downloadURL)}"
                    target="_blank"
                    rel="noopener"
                    download
                  >
                    ↓ Download Video
                  </a>
                `
                : ""
            }

          </div>

        </div>

      </div>


      <!-- BASIC INFORMATION -->

      <div class="music-details-section">

        <h3>Basic Information</h3>

        <div class="music-details-grid">

          ${detailItem("Title", title)}

          ${detailItem("Artist", artist)}

          ${detailItem("Album", album)}

          ${detailItem("Composer", composer)}

          ${detailItem("File Name", file.fileName)}

          ${detailItem("File Type", file.mimeType || file.type)}

          ${
            fileSize
              ? detailItem(
                  "File Size",
                  typeof fileSize === "number"
                    ? formatBytes(fileSize)
                    : fileSize
                )
              : ""
          }

          ${
            duration
              ? detailItem(
                  "Duration",
                  typeof duration === "number"
                    ? formatDuration(duration)
                    : duration
                )
              : ""
          }

          ${detailItem("Cover Source", file.coverSource)}

        </div>

      </div>


      <!-- VIDEO INFORMATION -->

      ${
        Object.keys(video).length
          ? `
            <div class="music-details-section">

              <h3>Video Information</h3>

              <div class="music-details-grid">

                ${detailItem(
                  "Resolution",
                  video.resolution ||
                  file.resolution
                )}

                ${detailItem(
                  "Codec",
                  video.codec ||
                  video.codec_name
                )}

                ${detailItem(
                  "Width",
                  video.width
                )}

                ${detailItem(
                  "Height",
                  video.height
                )}

                ${detailItem(
                  "Frame Rate",
                  video.frameRate ||
                  video.fps
                )}

                ${detailItem(
                  "Pixel Format",
                  video.pixelFormat ||
                  video.pix_fmt
                )}

                ${detailItem(
                  "Bitrate",
                  video.bitrate
                    ? `${formatNumber(video.bitrate)} bps`
                    : ""
                )}

              </div>

            </div>
          `
          : ""
      }


      <!-- AUDIO INFORMATION -->

      ${renderAudioTracks(file)}


      <!-- SUBTITLES -->

      ${renderSubtitleTracks(file)}


      <!-- PLAYBACK -->

      <div class="music-details-section">

        <h3>Web Audio Playback</h3>

        <div class="music-details-grid">

          ${detailItem(
            "Available",
            playbackAvailable
              ? "Yes"
              : "No"
          )}

          ${detailItem(
            "Codec",
            file.audioPlaybackCodec
          )}

          ${detailItem(
            "Stream",
            file.audioPlaybackStream
          )}

          ${detailItem(
            "Playback File",
            file.audioPlaybackFile
          )}

        </div>

      </div>


      <!-- ADDITIONAL JSON INFORMATION -->

      <div class="music-details-section">

        <h3>Additional Metadata</h3>

        <div class="music-details-raw">
${escapeHTML(JSON.stringify(file, null, 2))}
        </div>

      </div>
    `;
  }


  /* =========================================================
     OPEN POPUP
     ========================================================= */

  function openMusicDetails(file, index) {
    const modal =
      ensureDetailsModal();

    const content =
      modal.querySelector("#music-details-content");

    if (!content) return;

    content.innerHTML =
      buildDetailsHTML(file, index);

    const playButton =
      content.querySelector("#details-play-audio");

    if (playButton) {
      playButton.addEventListener("click", event => {
        event.preventDefault();

        const track =
          allTracks[
            Number(playButton.dataset.playIndex)
          ];

        if (!track) return;

        document.dispatchEvent(
          new CustomEvent("musicvault:play", {
            detail: {
              track,
              index: Number(
                playButton.dataset.playIndex
              )
            }
          })
        );

        closeMusicDetails();

        const player =
          document.getElementById("player");

        if (player) {
          setTimeout(() => {
            player.scrollIntoView({
              behavior: "smooth",
              block: "center"
            });
          }, 100);
        }
      });
    }

    modal.classList.add("open");

    document.body.dataset.musicDetailsOpen = "true";

    document.body.style.overflow = "hidden";
  }


  /* =========================================================
     CLOSE POPUP
     ========================================================= */

  function closeMusicDetails() {
    const modal =
      document.getElementById(
        "music-details-modal"
      );

    if (!modal) return;

    modal.classList.remove("open");

    delete document.body.dataset.musicDetailsOpen;

    document.body.style.overflow = "";
  }


  /* =========================================================
     LOAD MEDIA.JSON
     ========================================================= */

  async function loadMusicLibrary() {
    if (!libraryGrid) {
      console.warn("Music Vault: Library grid not found.");
      return;
    }

    try {
      libraryGrid.innerHTML = `
        <div class="music-empty-state">
          <div class="music-empty-icon">♫</div>
          <h3>Loading Music Vault...</h3>
          <p>Please wait.</p>
        </div>
      `;

      const response =
        await fetch(
          "./media.json?ts=" +
          Date.now(),
          {
            cache: "no-store"
          }
        );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      const data =
        await response.json();

      if (Array.isArray(data)) {
        allTracks = data;
      } else if (
        Array.isArray(data.media)
      ) {
        allTracks = data.media;
      } else if (
        Array.isArray(data.tracks)
      ) {
        allTracks = data.tracks;
      } else {
        allTracks = [];
      }

      window.musicVaultTracks =
        allTracks;

      renderMusicLibrary();

      console.log(
        `Music Vault: ${allTracks.length} tracks loaded.`
      );

    } catch (error) {

      console.error(
        "Music Vault: Failed to load media.json",
        error
      );

      libraryGrid.innerHTML = `
        <div class="music-empty-state">

          <div class="music-empty-icon">
            ⚠
          </div>

          <h3>
            Failed to load music
          </h3>

          <p>
            media.json could not be loaded.
          </p>

        </div>
      `;
    }
  }


  /* =========================================================
     GLOBAL EVENT SUPPORT
     ========================================================= */

  document.addEventListener(
    "musicvault:open-details",
    event => {

      const detail =
        event.detail || {};

      if (detail.track) {
        openMusicDetails(
          detail.track,
          detail.index || 0
        );
      }
    }
  );


  /* =========================================================
     INIT
     ========================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      injectDetailsStyles();
      ensureDetailsModal();
      loadMusicLibrary();
    }
  );

})();
