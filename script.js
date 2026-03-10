const sessionInput = document.getElementById("sessionInput");
const modeInput = document.getElementById("modeInput");
const moodButtons = document.querySelectorAll(".mood-button");
const startButton = document.getElementById("startButton");
const resetButton = document.getElementById("resetButton");
const clearHistoryButton = document.getElementById("clearHistoryButton");
const output = document.getElementById("output");
const outputBox = document.getElementById("outputBox");
const historyList = document.getElementById("historyList");

let selectedMood = "";
let sessionHistory = JSON.parse(localStorage.getItem("rauxSessionHistory")) || [];

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

function getTimestamp() {
  const now = new Date();
  return now.toLocaleString();
}

function saveHistory() {
  localStorage.setItem("rauxSessionHistory", JSON.stringify(sessionHistory));
}

function renderHistory() {
  if (sessionHistory.length === 0) {
    historyList.innerHTML = '<p class="empty-history">No sessions yet.</p>';
    return;
  }

  historyList.innerHTML = "";

  sessionHistory
    .slice()
    .reverse()
    .forEach(function(session) {
      const card = document.createElement("div");
      card.classList.add("history-card");

      card.innerHTML = `
        <strong>${session.sessionName}</strong><br>
        Mode: ${session.mode}<br>
        Mood: ${session.mood}<br>
        Type: ${session.rauxType}<br>
        Time: ${session.timestamp}
      `;

      historyList.appendChild(card);
    });
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
  const timestamp = getTimestamp();

  output.innerHTML = `
    Session: ${sessionName}<br>
    Mode: ${mode}<br>
    Mood: ${selectedMood}<br>
    Suggested Raux Type: ${rauxType}<br>
    Time: ${timestamp}
  `;

  clearBoxClasses();
  outputBox.classList.add(boxClass);

  const newSession = {
    sessionName: sessionName,
    mode: mode,
    mood: selectedMood,
    rauxType: rauxType,
    timestamp: timestamp
  };

  sessionHistory.push(newSession);
  saveHistory();
  renderHistory();
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

clearHistoryButton.addEventListener("click", function() {
  sessionHistory = [];
  saveHistory();
  renderHistory();
});

renderHistory();