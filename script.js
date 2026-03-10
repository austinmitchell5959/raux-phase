const sessionInput = document.getElementById("sessionInput");
const modeInput = document.getElementById("modeInput");
const moodButtons = document.querySelectorAll(".mood-button");
const startButton = document.getElementById("startButton");
const resetButton = document.getElementById("resetButton");
const clearHistoryButton = document.getElementById("clearHistoryButton");
const exportButton = document.getElementById("exportButton");
const filterMood = document.getElementById("filterMood");
const filterMode = document.getElementById("filterMode");
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
  const moodFilterValue = filterMood.value;
  const modeFilterValue = filterMode.value;

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

  if (filteredHistory.length === 0) {
    historyList.innerHTML = '<p class="empty-history">No matching sessions.</p>';
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

      if (newName === "") {
        return;
      }

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
    id: Date.now(),
    sessionName: sessionName,
    mode: mode,
    mood: selectedMood,
    rauxType: rauxType,
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

filterMood.addEventListener("change", function() {
  renderHistory();
});

filterMode.addEventListener("change", function() {
  renderHistory();
});

renderHistory();