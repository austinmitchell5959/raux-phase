function updateMusicForContext(context) {
  document.body.className = context;
  const info = document.getElementById("contextInfo");
  if (info) info.textContent = `Context: ${context}`;
  const track = pickTrackByMood(context);
  playTrack(track);
}// ==== RAUX LEARNING DASHBOARD ==== //
function showLearningStats() {
    const logs = JSON.parse(localStorage.getItem("rauxLogs") || "[]");
    const moodCounts = {};
    logs.forEach(l => {
      const mood = l.track.mood;
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });
    const summary =
      Object.entries(moodCounts)
        .map(([m, c]) => `${m}: ${c}`)
        .join(" | ") || "no data yet";
    console.log("📊 Raux learning summary:", summary);
    alert("Raux Learning Summary:\n" + summary);
  }
  // ==== VOICE RESPONSE ==== //
function speak(text) {
    if (!("speechSynthesis" in window)) {
      console.log("🗣️ Speech synthesis not supported here.");
      return;
    }
    const msg = new SpeechSynthesisUtterance(text);
    msg.rate = 1.05;
    msg.pitch = 1;
    speechSynthesis.speak(msg);
  }
  // ==== AUTO-DEMO MODE ==== //
function runDemo() {
    console.log("🎬 Starting Raux demo mode...");
    speak("Welcome to Raux. Starting the demo drive.");
  
    setTimeout(() => simulateDrive(25,"clear",10), 2000); // city
    setTimeout(() => speak("Now entering the highway."), 7000);
    setTimeout(() => simulateDrive(80,"clear",100), 9000); // highway
    setTimeout(() => speak("Sudden rain ahead."), 14000);
    setTimeout(() => simulateDrive(50,"rainy",60), 16000); // rainy
    setTimeout(() => playRauxRadio(), 21000); // radio intro clip
    setTimeout(() => speak("Returning to personalized music."), 26000);
    setTimeout(() => showLearningStats(), 28000);
    setTimeout(() => speak("Demo complete."), 30000);
  }
  let radioAudio = new Audio("raux_radio_intro.mp3");
radioAudio.preload = "auto";

function playRauxRadio() {
  // user-initiated event = safe
  radioAudio.volume = 0.8;
  radioAudio.currentTime = 0;
  radioAudio.play()
    .then(() => {
      console.log("📻 Raux Radio playing");
      setTimeout(() => startFadeOut(radioAudio, 4000), 16000);
      setTimeout(() => {
        console.log("🎵 Returning to personalized music");
        nextTrack();
      }, 20000);
    })
    .catch(err => console.error("Audio play blocked:", err));
}
