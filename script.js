const sessionInput = document.getElementById("sessionInput");
const modeInput = document.getElementById("modeInput");
const moodButtons = document.querySelectorAll(".mood-button");
const startButton = document.getElementById("startButton");
const resetButton = document.getElementById("resetButton");
const output = document.getElementById("output");
const outputBox = document.getElementById("outputBox");

let selectedMood = "";

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

function getBoxClass(rauxType) {
  if (rauxType === "Deep Work") {
    return "deep-work";
  } else if (rauxType === "Idea Sprint") {
    return "idea-sprint";
  } else if (rauxType === "Soft Session") {
    return "soft-session";
  } else if (rauxType === "Energy Boost") {
    return "energy-boost";
  } else {
    return "custom-session";
  }
}

function clearBoxClasses() {
  outputBox.className = "";
}

moodButtons.forEach(function(button) {
  button.addEventListener("click", function() {
    selectedMood = button.dataset.mood;

    moodButtons.forEach(function(btn) {
      btn.classList.remove("active");
    });

    button.classList.add("active");
  });
});

startButton.addEventListener("click", function() {
  const sessionName = sessionInput.value.trim();
  const mode = modeInput.value;

  if (sessionName === "" || mode === "" || selectedMood === "") {
    output.textContent = "Please fill out session name, mode, and mood.";
    clearBoxClasses();
    outputBox.classList.add("neutral");
    return;
  }

  const rauxType = getRauxType(selectedMood);
  const boxClass = getBoxClass(rauxType);

  output.innerHTML = `
    Session: ${sessionName}<br>
    Mode: ${mode}<br>
    Mood: ${selectedMood}<br>
    Suggested Raux Type: ${rauxType}
  `;

  clearBoxClasses();
  outputBox.classList.add(boxClass);
});

resetButton.addEventListener("click", function() {
  sessionInput.value = "";
  modeInput.value = "";
  selectedMood = "";

  moodButtons.forEach(function(button) {
    button.classList.remove("active");
  });

  output.textContent = "Waiting for input...";
  clearBoxClasses();
  outputBox.classList.add("neutral");
});