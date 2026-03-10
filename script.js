const sessionInput = document.getElementById("sessionInput");
const modeInput = document.getElementById("modeInput");
const categoryInput = document.getElementById("categoryInput");
const moodButtons = document.querySelectorAll(".mood-button");
const startButton = document.getElementById("startButton");
const resetButton = document.getElementById("resetButton");
const clearHistoryButton = document.getElementById("clearHistoryButton");
const exportButton = document.getElementById("exportButton");
const filterMood = document.getElementById("filterMood");
const filterMode = document.getElementById("filterMode");
const filterCategory = document.getElementById("filterCategory");
const searchInput = document.getElementById("searchInput");
const output = document.getElementById("output");
const outputBox = document.getElementById("outputBox");
const historyList = document.getElementById("historyList");
const spotifyButton = document.getElementById("spotifyButton");
const spotifyStatus = document.getElementById("spotifyStatus");

const totalSessions = document.getElementById("totalSessions");
const topMood = document.getElementById("topMood");
const topMode = document.getElementById("topMode");
const topCategory = document.getElementById("topCategory");

let selectedMood = "";
let sessionHistory = JSON.parse(localStorage.getItem("rauxSessionHistory")) || [];
let spotifyConnected = JSON.parse(localStorage.getItem("rauxSpotifyConnected")) || false;

function getRauxType(mood) {
  const lowerMood = mood.toLowerCase();

  if (lowerMood === "focused") return "Deep Work";
  if (lowerMood === "creative") return "Idea Sprint";
  if (lowerMood === "calm") return "Soft Session";
  if (lowerMood === "hype") return "Energy Boost";
  return "Custom Session";
}

function getBoxClass(rauxType) {
  if (rauxType === "Deep Work") return "deep-work";
  if (rauxType === "Idea Sprint") return "idea-sprint";
  if (rauxType === "Soft Session") return "soft-session";
  if (rauxType === "Energy Boost") return "energy-boost";
  return "custom-session";
}

function clearBoxClasses() {
  outputBox.className = "";
}

function getTimestamp() {
  return new Date().toLocaleString();
}

function saveHistory() {
  localStorage.setItem("rauxSessionHistory", JSON.stringify(sessionHistory));
}

function saveSpotifyState() {
  localStorage.setItem("rauxSpotifyConnected", JSON.stringify(spotifyConnected));
}

function updateSpotifyUI() {
  if (spotifyConnected) {
    spotifyStatus.textContent = "Spotify connected — prototype view only.";
    spotifyStatus.classList.add("connected");
    spotifyButton.innerHTML = `
      <span class="spotify-icon">
        <span></span>
        <span></span>
        <span></span>
      </span>
      <span>Spotify Connected</span>
    `;
  } else {
    spotifyStatus.textContent = "Not connected — prototype mode only.";
    spotifyStatus.classList.remove("connected");
    spotifyButton.innerHTML = `
      <span class="spotify-icon">
        <span></span>
        <span></span>
        <span></span>
      </span>
      <span>Connect to Spotify</span>
    `;
  }
}

function getTopValue(key) {
  if (sessionHistory.length === 0) return "-";

  const counts = {};

  sessionHistory.forEach(function(session) {
    counts[session[key]] = (counts[session[key]] || 0) + 1;
  });

  let winner = "-";
  let max = 0;

  for (const item in counts) {
    if (counts[item] > max) {
      max = counts[item];
      winner = item;
    }
  }

  return winner;
}

function updateStats() {
  totalSessions.textContent = sessionHistory.length;
  topMood.textContent = getTopValue("mood");
  topMode.textContent = getTopValue("mode");
  topCategory.textContent = getTopValue("category");
}

function renderHistory() {
  const moodFilterValue = filterMood.value;
  const modeFilterValue = filterMode.value;
  const categoryFilterValue = filterCategory.value;
  const searchValue = searchInput.value.trim().toLowerCase();

  let filteredHistory = sessionHistory.slice().reverse();

  if (moodFilterValue !== "all") {
    filteredHistory = filteredHistory.filter(function(session) {
      return session.mood === moodFilterValue;
    });
  }

  if (modeFilterValue !== "all") {
    filteredHistory = filteredHistory.filter(function(session) {
      return session.mode === modeFilterValue;
    });
  }

  if (categoryFilterValue !== "all") {
    filteredHistory = filteredHistory.filter(function(session) {
      return session.category === categoryFilterValue;
    });
  }

  if (searchValue !== "") {
    filteredHistory = filteredHistory.filter(function(session) {
      return (
        session.sessionName.toLowerCase().includes(searchValue) ||
        session.mode.toLowerCase().includes(searchValue) ||
        session.mood.toLowerCase().includes(searchValue) ||
        session.category.toLowerCase().includes(searchValue) ||
        session.rauxType.toLowerCase().includes(searchValue)
      );
    });
  }

  if (filteredHistory.length === 0) {
    historyList.innerHTML = '<p class="empty-history">No matching sessions.</p>';
    updateStats();
    return;
  }

  historyList.innerHTML = "";

  filteredHistory.forEach(function(session) {
    const card = document.createElement("div");
    card.classList.add("history-card");

    if (session.isEditing) {
      card.innerHTML = `
        <strong>Editing Session</strong><br>
        <input class="edit-input" type="text" value="${session.sessionName}" data-id="${session.id}">
        <div class="history-card-actions">
          <button class="save-edit-button" data-id="${session.id}" type="button">Save</button>
          <button class="cancel-edit-button" data-id="${session.id}" type="button">Cancel</button>
        </div>
      `;
    } else {
      card.innerHTML = `
        <strong>${session.sessionName}</strong><br>
        Mode: ${session.mode}<br>
        Category: ${session.category}<br>
        Mood: ${session.mood}<br>
        Type: ${session.rauxType}<br>
        Time: ${session.timestamp}
        <div class="history-card-actions">
          <button class="edit-button" data-id="${session.id}" type="button">Edit</button>
          <button class="delete-button" data-id="${session.id}" type="button">Delete</button>
        </div>
      `;
    }

    historyList.appendChild(card);
  });

  attachCardEvents();
  updateStats();
}

function attachCardEvents() {
  const deleteButtons = document.querySelectorAll(".delete-button");
  const editButtons = document.querySelectorAll(".edit-button");
  const saveEditButtons = document.querySelectorAll(".save-edit-button");
  const cancelEditButtons = document.querySelectorAll(".cancel-edit-button");

  deleteButtons.forEach(function(button) {
    button.addEventListener("click", function() {
      const id = Number(button.dataset.id);
      sessionHistory = sessionHistory.filter(function(session) {
        return session.id !== id;
      });
      saveHistory();
      renderHistory();
    });
  });

  editButtons.forEach(function(button) {
    button.addEventListener("click", function() {
      const id = Number(button.dataset.id);

      sessionHistory.forEach(function(session) {
        session.isEditing = session.id === id;
      });

      renderHistory();
    });
  });

  saveEditButtons.forEach(function(button) {
    button.addEventListener("click", function() {
      const id = Number(button.dataset.id);
      const input = document.querySelector(`.edit-input[data-id="${id}"]`);
      const newName = input.value.trim();

      if (newName === "") return;

      sessionHistory = sessionHistory.map(function(session) {
        if (session.id === id) {
          session.sessionName = newName;
          session.isEditing = false;
        } else {
          session.isEditing = false;
        }
        return session;
      });

      saveHistory();
      renderHistory();
    });
  });

  cancelEditButtons.forEach(function(button) {
    button.addEventListener("click", function() {
      const id = Number(button.dataset.id);

      sessionHistory = sessionHistory.map(function(session) {
        if (session.id === id) {
          session.isEditing = false;
        }
        return session;
      });

      renderHistory();
    });
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

spotifyButton.addEventListener("click", function() {
  spotifyConnected = !spotifyConnected;
  saveSpotifyState();
  updateSpotifyUI();
});

startButton.addEventListener("click", function() {
  const sessionName = sessionInput.value.trim();
  const mode = modeInput.value;
  const category = categoryInput.value;

  if (sessionName === "" || mode === "" || category === "" || selectedMood === "") {
    output.textContent = "Please fill out session name, mode, category, and mood.";
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
    Category: ${category}<br>
    Mood: ${selectedMood}<br>
    Suggested Raux Type: ${rauxType}<br>
    Spotify: ${spotifyConnected ? "Connected (prototype)" : "Not connected"}<br>
    Time: ${timestamp}
  `;

  clearBoxClasses();
  outputBox.classList.add(boxClass);

  const newSession = {
    id: Date.now(),
    sessionName: sessionName,
    mode: mode,
    category: category,
    mood: selectedMood,
    rauxType: rauxType,
    spotifyConnected: spotifyConnected,
    timestamp: timestamp,
    isEditing: false
  };

  sessionHistory.push(newSession);
  saveHistory();
  renderHistory();
});

resetButton.addEventListener("click", function() {
  sessionInput.value = "";
  modeInput.value = "";
  categoryInput.value = "";
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

exportButton.addEventListener("click", function() {
  const data = JSON.stringify(sessionHistory, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "raux-session-history.json";
  link.click();

  URL.revokeObjectURL(url);
});

filterMood.addEventListener("change", renderHistory);
filterMode.addEventListener("change", renderHistory);
filterCategory.addEventListener("change", renderHistory);
searchInput.addEventListener("input", renderHistory);

updateSpotifyUI();
renderHistory();
updateStats();