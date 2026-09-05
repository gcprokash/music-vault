// =========================================================
// MUSIC VAULT — MEDIA PLAYER
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


// =========================================================
// MEDIA ELEMENT
// =========================================================

const audio =
  document.createElement("audio");

audio.preload = "metadata";

audio.volume = 1;


// =========================================================
// MUSIC DATABASE
// =========================================================

const tracks = [

  // -------------------------------------------------------
  // TRACK 01 — HAME TORA DIL DELI
  // -------------------------------------------------------

  {
    title:
      "Hame Tora Dil Deli",

    subtitle:
      "1440p • VP9 • Hi-Res ALAC • Multi Audio",

    path:
      "Hame Tora Dil Deli [1440p] [VP9] [Hi-Res ALAC] [Multi Audio] [Tri-Lingual Subs] [GCP].mkv",

    cover:
      "Hame Tora Dil Deli.jpg"
  },


  // -------------------------------------------------------
  // TRACK 02 — AMER ACHAAR
  // -------------------------------------------------------

  {
    title:
      "Amer Achaar",

    subtitle:
      "1440p • VP9 • Hi-Res ALAC • Multi Audio",

    path:
      "Amer Achaar [1440p] [VP9] [Hi-Res ALAC] [Multi Audio] [Bi-Lingual Subs] [GCP].mkv",

    cover:
      "Amer Achaar.jpg"
  }

];


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


  if (track.cover) {

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
    track.title;

  playerSubtitle.textContent =
    track.subtitle;


  // -------------------------------------------------------
  // Cover
  // -------------------------------------------------------

  updatePlayerCover(track);


  // -------------------------------------------------------
  // Reset Player
  // -------------------------------------------------------

  audio.pause();

  audio.currentTime = 0;

  progressBar.value = 0;

  currentTimeElement.textContent =
    "0:00";

  durationElement.textContent =
    "0:00";


  // -------------------------------------------------------
  // Load Media
  // -------------------------------------------------------

  audio.src =
    track.path;

  audio.load();

  isLoaded = true;


  updatePlayButton(false);


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

  if (!isLoaded) {

    loadTrack(
      currentTrackIndex,
      false
    );

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
          "Unable to play this media file";

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


    progressBar.value =
      percentage;


    currentTimeElement.textContent =
      formatTime(
        audio.currentTime
      );

  }
);


// =========================================================
// LOADED METADATA
// =========================================================

audio.addEventListener(
  "loadedmetadata",
  () => {

    durationElement.textContent =
      formatTime(
        audio.duration
      );

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
        ) * audio.duration;

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


    playerSubtitle.textContent =
      "This media format cannot be played here";


    console.error(
      "Music Vault:",
      "Media loading error",
      audio.error
    );

  }
);


// =========================================================
// LIBRARY PLAY BUTTONS
// =========================================================

const musicPlayButtons =
  document.querySelectorAll(
    ".music-play"
  );


musicPlayButtons.forEach(
  (button, index) => {

    button.addEventListener(
      "click",
      (event) => {

        event.preventDefault();


        // -------------------------------------------------
        // Check Track
        // -------------------------------------------------

        if (!tracks[index]) {

          playerTitle.textContent =
            "Track Not Added Yet";

          playerSubtitle.textContent =
            "This song will be added later";

          return;

        }


        // -------------------------------------------------
        // Load Selected Track
        // -------------------------------------------------

        loadTrack(
          index,
          true
        );


        // -------------------------------------------------
        // Scroll to Player
        // -------------------------------------------------

        if (playerSection) {

          playerSection.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });

        }

      }
    );

  }
);


// =========================================================
// INITIAL PLAYER
// =========================================================

if (tracks.length > 0) {

  loadTrack(
    0,
    false
  );

} else {

  playerTitle.textContent =
    "No Track Selected";

  playerSubtitle.textContent =
    "Select a song from your library";

}


// =========================================================
// PLAYER READY
// =========================================================

console.log(
  "Music Vault Player initialized."
);