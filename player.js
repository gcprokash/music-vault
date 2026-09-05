// =========================================================
// MUSIC VAULT — MEDIA PLAYER
// Dynamic Audio Player
// media.json → Player
// =========================================================


// =========================================================
// PLAYER ELEMENTS
// =========================================================

const playerSection =
  document.querySelector(".media-player-section");

const mediaPlayer =
  document.querySelector(".media-player");

const playerTitle =
  document.getElementById("player-title");

const playerSubtitle =
  document.getElementById("player-subtitle");

const playButton =
  document.getElementById("player-play");

const previousButton =
  document.querySelector(".player-prev");

const nextButton =
  document.querySelector(".player-next");

const progressBar =
  document.getElementById("player-progress-bar");

const currentTimeElement =
  document.getElementById("player-current-time");

const durationElement =
  document.getElementById("player-duration");

const volumeBar =
  document.getElementById("player-volume-bar");

const downloadButton =
  document.getElementById("player-download");


// =========================================================
// MEDIA ELEMENT
// =========================================================

const audio =
  document.createElement("audio");

audio.preload = "metadata";

audio.volume = 1;


// =========================================================
// MUSIC DATABASE
// Loaded from media.json
// =========================================================

let tracks = [];


// =========================================================
// PLAYER STATE
// =========================================================

let currentTrackIndex = 0;

let isLoaded = false;


// =========================================================
// FORMAT TIME
// =========================================================

function formatTime(seconds) {

  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  const minutes =
    Math.floor(seconds / 60);

  const remainingSeconds =
    Math.floor(seconds % 60);

  return (
    minutes +
    ":" +
    String(remainingSeconds).padStart(2, "0")
  );

}


// =========================================================
// UPDATE PLAY BUTTON
// =========================================================

function updatePlayButton(isPlaying) {

  if (!playButton) {
    return;
  }

  if (isPlaying) {

    playButton.textContent =
      "❚❚";

    playButton.setAttribute(
      "aria-label",
      "Pause"
    );

    if (mediaPlayer) {

      mediaPlayer.classList.add(
        "is-playing"
      );

    }

  } else {

    playButton.textContent =
      "▶";

    playButton.setAttribute(
      "aria-label",
      "Play"
    );

    if (mediaPlayer) {

      mediaPlayer.classList.remove(
        "is-playing"
      );

    }

  }

}


// =========================================================
// UPDATE PLAYER COVER
// =========================================================

function updatePlayerCover(track) {

  const playerCover =
    document.querySelector(
      ".player-cover"
    );

  if (!playerCover) {
    return;
  }

  if (track && track.cover) {

    playerCover.style.backgroundImage =
      `url("${track.cover}")`;

    playerCover.style.backgroundSize =
      "cover";

    playerCover.style.backgroundPosition =
      "center";

    playerCover.textContent = "";

  } else {

    playerCover.style.backgroundImage =
      "";

    playerCover.style.backgroundSize =
      "";

    playerCover.style.backgroundPosition =
      "";

    playerCover.textContent =
      "MV";

  }

}


// =========================================================
// BUILD PLAYER SUBTITLE
// =========================================================

function buildPlayerSubtitle(track) {

  if (!track) {
    return "Select a song from your library";
  }

  const parts = [];


  // Artist
  if (track.artist) {

    parts.push(
      track.artist
    );

  }


  // Resolution
  if (track.video?.height) {

    const height =
      Number(track.video.height);

    if (height >= 2160) {

      parts.push("2160p");

    } else if (height >= 1440) {

      parts.push("1440p");

    } else if (height >= 1080) {

      parts.push("1080p");

    } else if (height >= 720) {

      parts.push("720p");

    }

  }


  // Video codec
  if (track.video?.codec) {

    parts.push(
      track.video.codec.toUpperCase()
    );

  }


  // Hi-Res
  const hiResTrack =
    getHiResTrack(track);

  if (hiResTrack) {

    parts.push(
      "Hi-Res " +
      String(
        hiResTrack.codec || ""
      ).toUpperCase()
    );

  }


  // Multi Audio
  if (
    track.audio &&
    Number(track.audio.trackCount) > 1
  ) {

    parts.push(
      "Multi Audio"
    );

  }


  if (parts.length) {

    return parts.join(" • ");

  }


  return "Premium Music Release";

}


// =========================================================
// FIND HI-RES TRACK
// =========================================================

function getHiResTrack(track) {

  if (
    !track?.audio ||
    !Array.isArray(track.audio.tracks)
  ) {

    return null;

  }


  // Scanner detected Hi-Res track
  if (track.audio.hiResTrack) {

    const detected =
      track.audio.tracks.find(
        item =>
          Number(item.index) ===
          Number(track.audio.hiResTrack)
      );

    if (detected) {
      return detected;
    }

  }


  // Fallback
  return track.audio.tracks.find(
    item => {

      const codec =
        String(
          item.codec || ""
        ).toLowerCase();

      return (
        codec === "alac" ||
        codec === "flac" ||
        codec === "wav"
      );

    }
  ) || null;

}


// =========================================================
// GET PLAYBACK SOURCE
// =========================================================

function getPlaybackSource(track) {

  if (!track) {
    return "";
  }


  /*
   * Playback priority:
   *
   * 1. playbackUrl
   * 2. audioPlaybackUrl
   * 3. audioUrl
   * 4. path
   */


  if (track.playbackUrl) {

    return track.playbackUrl;

  }


  if (track.audioPlaybackUrl) {

    return track.audioPlaybackUrl;

  }


  if (track.audioUrl) {

    return track.audioUrl;

  }


  if (track.path) {

    return track.path;

  }


  return "";

}


// =========================================================
// GET ORIGINAL VIDEO DOWNLOAD URL
// =========================================================

function getDownloadUrl(track) {

  if (!track) {
    return "";
  }


  /*
   * Original Video Download priority:
   *
   * 1. downloadUrl
   * 2. driveUrl
   * 3. url
   */


  if (track.downloadUrl) {

    return track.downloadUrl;

  }


  if (track.driveUrl) {

    return track.driveUrl;

  }


  if (track.url) {

    return track.url;

  }


  return "";

}


// =========================================================
// UPDATE DOWNLOAD BUTTON
// =========================================================

function updateDownloadButton(track) {

  if (!downloadButton) {
    return;
  }


  const downloadUrl =
    getDownloadUrl(track);


  if (!downloadUrl) {

    downloadButton.removeAttribute(
      "href"
    );

    downloadButton.setAttribute(
      "aria-disabled",
      "true"
    );

    downloadButton.style.pointerEvents =
      "none";

    downloadButton.style.opacity =
      "0.5";

    return;

  }


  downloadButton.href =
    downloadUrl;

  downloadButton.target =
    "_blank";

  downloadButton.rel =
    "noopener";


  downloadButton.removeAttribute(
    "aria-disabled"
  );


  downloadButton.style.pointerEvents =
    "";

  downloadButton.style.opacity =
    "";


  downloadButton.setAttribute(
    "download",
    ""
  );

}


// =========================================================
// LOAD TRACK
// =========================================================

function loadTrack(
  index,
  autoplay = false
) {

  if (!tracks.length) {

    playerTitle.textContent =
      "No Track Available";

    playerSubtitle.textContent =
      "Add a media file to the library";

    updateDownloadButton(null);

    isLoaded = false;

    return;

  }


  // -------------------------------------------------------
  // Loop index
  // -------------------------------------------------------

  if (index < 0) {

    index =
      tracks.length - 1;

  }


  if (
    index >= tracks.length
  ) {

    index = 0;

  }


  currentTrackIndex =
    index;


  const track =
    tracks[currentTrackIndex];


  // -------------------------------------------------------
  // Track Information
  // -------------------------------------------------------

  playerTitle.textContent =
    track.title ||
    "Unknown Title";


  playerSubtitle.textContent =
    buildPlayerSubtitle(track);


  // -------------------------------------------------------
  // Cover
  // -------------------------------------------------------

  updatePlayerCover(track);


  // -------------------------------------------------------
  // Download
  // -------------------------------------------------------

  updateDownloadButton(track);


  // -------------------------------------------------------
  // Reset Player
  // -------------------------------------------------------

  audio.pause();

  audio.removeAttribute("src");

  audio.load();


  if (progressBar) {

    progressBar.value = 0;

  }


  if (currentTimeElement) {

    currentTimeElement.textContent =
      "0:00";

  }


  if (durationElement) {

    durationElement.textContent =
      "0:00";

  }


  isLoaded = false;


  updatePlayButton(false);


  // -------------------------------------------------------
  // Playback Source
  // -------------------------------------------------------

  const source =
    getPlaybackSource(track);


  if (!source) {

    playerSubtitle.textContent =
      buildPlayerSubtitle(track) +
      " • Audio playback unavailable";

    return;

  }


  // -------------------------------------------------------
  // Load Audio
  // -------------------------------------------------------

  audio.src =
    source;

  audio.load();

  isLoaded = true;


  // -------------------------------------------------------
  // Autoplay
  // -------------------------------------------------------

  if (autoplay) {

    playTrack();

  }

}


// =========================================================
// PLAY
// =========================================================

function playTrack() {

  if (!tracks.length) {
    return;
  }


  if (!isLoaded) {

    loadTrack(
      currentTrackIndex,
      false
    );

  }


  if (!audio.src) {

    playerSubtitle.textContent =
      "Audio playback unavailable";

    return;

  }


  const playPromise =
    audio.play();


  if (
    playPromise !== undefined
  ) {

    playPromise
      .then(() => {

        updatePlayButton(true);

      })
      .catch((error) => {

        updatePlayButton(false);


        playerSubtitle.textContent =
          buildPlayerSubtitle(
            tracks[currentTrackIndex]
          ) +
          " • Unable to play audio";


        console.warn(
          "Music Vault Player:",
          error
        );

      });

  }

}


// =========================================================
// PAUSE
// =========================================================

function pauseTrack() {

  audio.pause();

  updatePlayButton(false);

}


// =========================================================
// PLAY / PAUSE BUTTON
// =========================================================

if (playButton) {

  playButton.addEventListener(
    "click",
    () => {

      if (audio.paused) {

        playTrack();

      } else {

        pauseTrack();

      }

    }
  );

}


// =========================================================
// PREVIOUS TRACK
// =========================================================

if (previousButton) {

  previousButton.addEventListener(
    "click",
    () => {

      if (!tracks.length) {
        return;
      }


      currentTrackIndex--;


      if (
        currentTrackIndex < 0
      ) {

        currentTrackIndex =
          tracks.length - 1;

      }


      loadTrack(
        currentTrackIndex,
        true
      );

    }
  );

}


// =========================================================
// NEXT TRACK
// =========================================================

if (nextButton) {

  nextButton.addEventListener(
    "click",
    () => {

      if (!tracks.length) {
        return;
      }


      currentTrackIndex++;


      if (
        currentTrackIndex >=
        tracks.length
      ) {

        currentTrackIndex = 0;

      }


      loadTrack(
        currentTrackIndex,
        true
      );

    }
  );

}


// =========================================================
// TIME UPDATE
// =========================================================

audio.addEventListener(
  "timeupdate",
  () => {

    if (
      !Number.isFinite(
        audio.duration
      ) ||
      audio.duration <= 0
    ) {

      return;

    }


    const percentage =
      (
        audio.currentTime /
        audio.duration
      ) * 100;


    if (progressBar) {

      progressBar.value =
        percentage;

    }


    if (currentTimeElement) {

      currentTimeElement.textContent =
        formatTime(
          audio.currentTime
        );

    }

  }
);


// =========================================================
// LOADED METADATA
// =========================================================

audio.addEventListener(
  "loadedmetadata",
  () => {

    if (durationElement) {

      durationElement.textContent =
        formatTime(
          audio.duration
        );

    }

  }
);


// =========================================================
// PROGRESS BAR
// =========================================================

if (progressBar) {

  progressBar.addEventListener(
    "input",
    () => {

      if (
        !Number.isFinite(
          audio.duration
        ) ||
        audio.duration <= 0
      ) {

        return;

      }


      const percentage =
        Number(
          progressBar.value
        );


      audio.currentTime =
        (
          percentage / 100
        ) *
        audio.duration;

    }
  );

}


// =========================================================
// VOLUME
// =========================================================

if (volumeBar) {

  volumeBar.addEventListener(
    "input",
    () => {

      audio.volume =
        Number(
          volumeBar.value
        );

    }
  );

}


// =========================================================
// MEDIA PLAYING
// =========================================================

audio.addEventListener(
  "play",
  () => {

    updatePlayButton(true);

  }
);


// =========================================================
// MEDIA PAUSED
// =========================================================

audio.addEventListener(
  "pause",
  () => {

    updatePlayButton(false);

  }
);


// =========================================================
// TRACK ENDED
// =========================================================

audio.addEventListener(
  "ended",
  () => {

    if (!tracks.length) {
      return;
    }


    currentTrackIndex++;


    if (
      currentTrackIndex >=
      tracks.length
    ) {

      currentTrackIndex = 0;

    }


    loadTrack(
      currentTrackIndex,
      true
    );

  }
);


// =========================================================
// ERROR HANDLING
// =========================================================

audio.addEventListener(
  "error",
  () => {

    updatePlayButton(false);


    if (tracks[currentTrackIndex]) {

      playerSubtitle.textContent =
        buildPlayerSubtitle(
          tracks[currentTrackIndex]
        ) +
        " • This audio format cannot be played here";

    } else {

      playerSubtitle.textContent =
        "This audio format cannot be played here";

    }


    console.error(
      "Music Vault:",
      "Audio loading error",
      audio.error
    );

  }
);


// =========================================================
// DYNAMIC LIBRARY PLAY EVENT
// =========================================================

window.addEventListener(
  "musicvault:play",
  (event) => {

    const detail =
      event.detail;


    if (!detail) {
      return;
    }


    const track =
      detail.track;


    const index =
      Number(detail.index);


    if (!track) {
      return;
    }


    // -----------------------------------------------------
    // Sync Player Database
    // -----------------------------------------------------

    if (
      Array.isArray(
        window.musicVaultTracks
      )
    ) {

      tracks =
        window.musicVaultTracks;

    }


    // -----------------------------------------------------
    // Selected Track
    // -----------------------------------------------------

    if (
      Number.isInteger(index) &&
      index >= 0 &&
      index < tracks.length
    ) {

      loadTrack(
        index,
        true
      );

    }

  }
);


// =========================================================
// WAIT FOR MEDIA JSON
// =========================================================

function syncWithMusicLibrary() {

  if (
    Array.isArray(
      window.musicVaultTracks
    )
  ) {

    tracks =
      window.musicVaultTracks;


    if (!tracks.length) {

      playerTitle.textContent =
        "No Track Selected";

      playerSubtitle.textContent =
        "No media files found";

      updateDownloadButton(null);

      return;

    }


    // Load first track without autoplay
    loadTrack(
      0,
      false
    );


    console.log(
      "Music Vault Player:",
      tracks.length,
      "track(s) ready."
    );

  }

}


// =========================================================
// INITIAL SYNC
// =========================================================

syncWithMusicLibrary();


// =========================================================
// LIBRARY LOADED EVENT WATCH
// =========================================================

const librarySyncInterval =
  setInterval(
    () => {

      if (
        Array.isArray(
          window.musicVaultTracks
        ) &&
        window.musicVaultTracks.length > 0
      ) {

        tracks =
          window.musicVaultTracks;


        clearInterval(
          librarySyncInterval
        );


        loadTrack(
          0,
          false
        );


        console.log(
          "Music Vault Player:",
          tracks.length,
          "track(s) synchronized."
        );

      }

    },
    100
  );


// =========================================================
// SAFETY TIMEOUT
// =========================================================

setTimeout(
  () => {

    clearInterval(
      librarySyncInterval
    );

  },
  10000
);


// =========================================================
// PLAYER READY
// =========================================================

console.log(
  "Music Vault Audio Player initialized."
);