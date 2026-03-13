  input: process.stdin,
  output: process.stdout
});

const appName = "Raux Phase 2";

function getRauxType(mood) {
  const lowerMood = mood.toLowerCase();

  if (lowerMood === "focused") {
    return "Deep Work";
  } else if (lowerMood === "creative") {
    return "Idea Sprint";
  } else if (lowerMood === "calm") {
    return "Soft Session";
  } else if (lowerMood === "hype") {
    return "Energy Boost";
  } else {
    return "Custom Session";
  }
}

console.log(`${appName} is running`);

rl.question("What do you want to call this session? ", function(sessionName) {
  rl.question("What mode are we in? ", function(mode) {
    rl.question("What is the mood? ", function(mood) {
      const rauxType = getRauxType(mood);

      console.log("\n--- Session Summary ---");
      console.log(`App: ${appName}`);
      console.log(`Session: ${sessionName}`);
      console.log(`Mode: ${mode}`);
      console.log(`Mood: ${mood}`);
      console.log(`Suggested Raux Type: ${rauxType}`);

      rl.close();
    });
  });
});
// app.js — Basic mock player for Raux
console.log("✅ app.js loaded");

function getRandomTrack() {
  const allTracks = [
    ...window.mockPlaylists.spotify,
    ...window.mockPlaylists.apple,
    ...window.mockPlaylists.soundcloud
  ];
  return allTracks[Math.floor(Math.random() * allTracks.length)];
}

function playTrack(track) {
  console.log(`🎵 Now playing: ${track.title} — ${track.artist} [${track.mood}]`);
  const display = document.getElementById("output") || document.body;
  display.innerHTML = `<p>🎵 ${track.title} — ${track.artist}</p>`;
}

function nextTrack() {
  const next = getRandomTrack();
  playTrack(next);
  logBehavior("play", next);
}

// Behavior logging
function logBehavior(eventType, track) {
  const entry = { event: eventType, track, time: new Date().toLocaleTimeString() };
  const logs = JSON.parse(localStorage.getItem("rauxLogs") || "[]");
  logs.push(entry);
  localStorage.setItem("rauxLogs", JSON.stringify(logs));
}

// Test button (optional)
document.addEventListener("keydown", (e) => {
  if (e.key === "n") nextTrack(); // press “n” to skip
});

// preload first track
window.addEventListener("load", () => {
  playTrack(getRandomTrack());
});
// ==== DRIVE SYNC SIMULATOR ==== //
console.log("✅ DriveSync active");

function simulateDrive(speed, weather, distance) {
  let context = "standard";

  if (speed > 70) context = "highway";
  else if (speed < 30) context = "city";
  if (weather === "rainy") context = "rainy";
  if (distance > 200) context = "longtrip";

  console.log(`🛣️ Drive context: ${context}`);
  updateMusicForContext(context);
}

function updateMusicForContext(context) {
  const track = pickTrackByMood(context);
  playTrack(track);
}

function pickTrackByMood(context) {
  const allTracks = [
    ...mockPlaylists.spotify,
    ...mockPlaylists.apple,
    ...mockPlaylists.soundcloud
  ];

  // Simple mapping between drive context and track moods
  const moodMap = {
    highway: "energy",
    city: "focus",
    rainy: "rainy",
    longtrip: "chill",
    standard: "night"
  };

  const mood = moodMap[context] || "night";
  const filtered = allTracks.filter(t => t.mood === mood);
  if (filtered.length > 0) return filtered[Math.floor(Math.random() * filtered.length)];
  return getRandomTrack(); // fallback
}
