const sessionInput = document.getElementById("sessionInput");
const modeInput = document.getElementById("modeInput");
const moodInput = document.getElementById("moodInput");
const startButton = document.getElementById("startButton");
const output = document.getElementById("output");

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

startButton.addEventListener("click", function() {
  const sessionName = sessionInput.value.trim();
  const mode = modeInput.value;
  const mood = moodInput.value;

  if (sessionName === "" || mode === "" || mood === "") {
    output.textContent = "Please fill out session name, mode, and mood.";
    return;
  }

  const rauxType = getRauxType(mood);

  output.innerHTML = `
    Session: ${sessionName}<br>
    Mode: ${mode}<br>
    Mood: ${mood}<br>
    Suggested Raux Type: ${rauxType}
  `;
});