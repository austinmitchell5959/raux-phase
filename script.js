const sessionInput = document.getElementById("sessionInput");
const contextInput = document.getElementById("contextInput");
const goalInput = document.getElementById("goalInput");
const modeInput = document.getElementById("modeInput");
const categoryInput = document.getElementById("categoryInput");
const notesInput = document.getElementById("notesInput");
const moodButtons = document.querySelectorAll(".mood-button");
const presetButtons = document.querySelectorAll(".preset-button");
const startButton = document.getElementById("startButton");
const resetButton = document.getElementById("resetButton");
const clearHistoryButton = document.getElementById("clearHistoryButton");
const exportButton = document.getElementById("exportButton");
const favoritesOnlyButton = document.getElementById("favoritesOnlyButton");
const driveModeButton = document.getElementById("driveModeButton");
const filterMood = document.getElementById("filterMood");
const filterMode = document.getElementById("filterMode");
const filterCategory = document.getElementById("filterCategory");
const searchInput = document.getElementById("searchInput");
const output = document.getElementById("output");
const outputBox = document.getElementById("outputBox");
const historyList = document.getElementById("historyList");
const feedbackMessage = document.getElementById("feedbackMessage");
const undoBanner = document.getElementById("undoBanner");
const undoDeleteButton = document.getElementById("undoDeleteButton");

const recommendationWhy = document.getElementById("recommendationWhy");
const thumbsUpButton = document.getElementById("thumbsUpButton");
const thumbsDownButton = document.getElementById("thumbsDownButton");

const timerDisplay = document.getElementById("timerDisplay");
const timerStartButton = document.getElementById("timerStartButton");
const timerPauseButton = document.getElementById("timerPauseButton");
const timerResetButton = document.getElementById("timerResetButton");

const spotifyButton = document.getElementById("spotifyButton");
const appleMusicButton = document.getElementById("appleMusicButton");
const soundcloudButton = document.getElementById("soundcloudButton");

const spotifyStatus = document.getElementById("spotifyStatus");
const appleMusicStatus = document.getElementById("appleMusicStatus");
const soundcloudStatus = document.getElementById("soundcloudStatus");

const totalSessions = document.getElementById("totalSessions");
const topMood = document.getElementById("topMood");
const topMode = document.getElementById("topMode");
const topCategory = document.getElementById("topCategory");

const connectedServicesCount = document.getElementById("connectedServicesCount");
const primarySource = document.getElementById("primarySource");
const recommendedSource = document.getElementById("recommendedSource");
const sessionState = document.getElementById("sessionState");
const sessionScore = document.getElementById("sessionScore");
const lastCategory = document.getElementById("lastCategory");
const lastMood = document.getElementById("lastMood");

let selectedMood = "";
let favoritesOnly = false;
let lastDeletedSession = null;
let lastCreatedSessionId = null;

let sessionHistory = JSON.parse(localStorage.getItem("rauxSessionHistory")) || [];
let musicConnections = JSON.parse(localStorage.getItem("rauxMusicConnections")) || {
  spotify: false,
  appleMusic: false,
  soundcloud: false
};
let driveMode = JSON.parse(localStorage.getItem("rauxDriveMode")) || false;

let timerSeconds = 0;
let timerInterval = null;

function setFeedback(message) {
  feedbackMessage.textContent = message;
  if (message) {
    setTimeout(function () {
      if (feedbackMessage.textContent === message) {
        feedbackMessage.textContent = "";
      }
    }, 1800);
  }
}

function saveHistory() {
  localStorage.setItem("rauxSessionHistory", JSON.stringify(sessionHistory));
}

function saveMusicConnections() {
  localStorage.setItem("rauxMusicConnections", JSON.stringify(musicConnections));
}

function saveDriveMode() {
  localStorage.setItem("rauxDriveMode", JSON.stringify(driveMode));
}

function getTimestamp() {
  return new Date().toLocaleString();
}

function getConnectedCount() {
  return Object.values(musicConnections).filter(Boolean).length;
}

function getPrimarySource() {
  if (musicConnections.spotify) return "Spotify";
  if (musicConnections.appleMusic) return "Apple Music";
  if (musicConnections.soundcloud) return "SoundCloud";
  return "None";
}

function getRauxType(mood) {
  const lowerMood = mood.toLowerCase();

  if (lowerMood === "focused") return "Deep Work";
  if (lowerMood === "creative") return "Idea Sprint";
  if (lowerMood === "calm") return "Soft Session";
  if (lowerMood === "hype") return "Energy Boost";
  return "Custom Session";
}

function getMemoryBias(service, context, goal, mood, category) {
  let bias = 0;

  sessionHistory.forEach(function (session) {
    if (session.recommendedSource !== service) return;

    let matchPoints = 0;
    if (session.context === context) matchPoints += 1;
    if (session.goal === goal) matchPoints += 1;
    if (session.mood === mood) matchPoints += 1;
    if (session.category === category) matchPoints += 1;

    if (matchPoints > 0) {
      if (session.feedback === "good") bias += matchPoints * 4;
      if (session.feedback === "bad") bias -= matchPoints * 4;
    }
  });

  return bias;
}

function getBaseRecommendation(context, goal, category, mood) {
  if (context === "driving" || goal === "safe-drive") return "Spotify";
  if (context === "working" || context === "studying" || goal === "focus" || category === "focus" || mood === "focused") return "Spotify";
  if (goal === "discover" || goal === "brainstorm" || category === "creative" || mood === "creative") return "SoundCloud";
  if (context === "relaxing" || context === "late-night" || goal === "calm-down" || category === "recovery" || mood === "calm") return "Apple Music";
  if (context === "gym" || goal === "energize" || category === "energy" || mood === "hype") return "SoundCloud";
  return "Spotify";
}

function getRecommendedSource(context, goal, category, mood) {
  const services = ["Spotify", "Apple Music", "SoundCloud"];
  const scores = {
    "Spotify": 50,
    "Apple Music": 50,
    "SoundCloud": 50
  };

  const base = getBaseRecommendation(context, goal, category, mood);
  scores[base] += 18;

  if (context === "driving") scores["Spotify"] += 12;
  if (context === "working" || context === "studying") scores["Spotify"] += 10;
  if (context === "relaxing" || context === "late-night") scores["Apple Music"] += 10;
  if (context === "gym") scores["SoundCloud"] += 10;

  if (goal === "focus") scores["Spotify"] += 10;
  if (goal === "discover" || goal === "brainstorm") scores["SoundCloud"] += 12;
  if (goal === "calm-down") scores["Apple Music"] += 12;
  if (goal === "energize") scores["SoundCloud"] += 10;
  if (goal === "safe-drive") scores["Spotify"] += 14;

  if (category === "focus") scores["Spotify"] += 8;
  if (category === "creative") scores["SoundCloud"] += 8;
  if (category === "recovery") scores["Apple Music"] += 8;
  if (category === "energy") scores["SoundCloud"] += 8;

  if (mood === "focused") scores["Spotify"] += 8;
  if (mood === "creative") scores["SoundCloud"] += 8;
  if (mood === "calm") scores["Apple Music"] += 8;
  if (mood === "hype") scores["SoundCloud"] += 8;

  services.forEach(function (service) {
    scores[service] += getMemoryBias(service, context, goal, mood, category);
  });

  if (musicConnections.spotify) scores["Spotify"] += 6;
  if (musicConnections.appleMusic) scores["Apple Music"] += 6;
  if (musicConnections.soundcloud) scores["SoundCloud"] += 6;

  let winner = "Spotify";
  let max = -Infinity;

  services.forEach(function (service) {
    if (scores[service] > max) {
      max = scores[service];
      winner = service;
    }
  });

  return { winner, scores };
}

function buildRecommendationWhy(context, goal, category, mood, recommended, scores) {
  const reasons = [];

  reasons.push(`Recommended ${recommended} based on your current session profile.`);

  if (context) reasons.push(`Context selected: ${context}.`);
  if (goal) reasons.push(`Goal selected: ${goal}.`);
  if (category) reasons.push(`Category selected: ${category}.`);
  if (mood) reasons.push(`Mood selected: ${mood}.`);

  if (recommended === "Spotify" && musicConnections.spotify) {
    reasons.push("Spotify is currently connected, which increased recommendation confidence.");
  }

  if (recommended === "Apple Music" && musicConnections.appleMusic) {
    reasons.push("Apple Music is currently connected, which increased recommendation confidence.");
  }

  if (recommended === "SoundCloud" && musicConnections.soundcloud) {
    reasons.push("SoundCloud is currently connected, which increased recommendation confidence.");
  }

  const bestScore = scores[recommended];
  if (bestScore >= 85) {
    reasons.push("Confidence: High.");
  } else if (bestScore >= 70) {
    reasons.push("Confidence: Medium.");
  } else {
    reasons.push("Confidence: Early-stage.");
  }

  return reasons.join(" ");
}

function getSessionScore(mode, category, mood, recommended, context, goal) {
  let score = 45;

  if (mode && category && mood && context && goal) score += 20;
  if (recommended === "Spotify" && musicConnections.spotify) score += 10;
  if (recommended === "Apple Music" && musicConnections.appleMusic) score += 10;
  if (recommended === "SoundCloud" && musicConnections.soundcloud) score += 10;

  if (category === "focus" && mood === "focused") score += 8;
  if (category === "creative" && mood === "creative") score += 8;
  if (category === "recovery" && mood === "calm") score += 8;
  if (category === "energy" && mood === "hype") score += 8;

  if (context === "driving" && goal === "safe-drive") score += 8;
  if (context === "working" && goal === "focus") score += 8;
  if (context === "relaxing" && goal === "calm-down") score += 8;
  if (context === "gym" && goal === "energize") score += 8;

  return Math.min(score, 100);
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

function setSelectedMood(mood) {
  selectedMood = mood;
  moodButtons.forEach(function (button) {
    button.classList.toggle("active", button.dataset.mood === mood);
  });
}

function applyPreset(presetName) {
  if (presetName === "deep-focus") {
    sessionInput.value = "Deep Focus Session";
    contextInput.value = "working";
    goalInput.value = "focus";
    modeInput.value = "build";
    categoryInput.value = "focus";
    notesInput.value = "Focused work block.";
    setSelectedMood("focused");
  } else if (presetName === "creative-sprint") {
    sessionInput.value = "Creative Sprint";
    contextInput.value = "working";
    goalInput.value = "brainstorm";
    modeInput.value = "prototype";
    categoryInput.value = "creative";
    notesInput.value = "Idea generation and creative flow.";
    setSelectedMood("creative");
  } else if (presetName === "recovery-reset") {
    sessionInput.value = "Recovery Reset";
    contextInput.value = "relaxing";
    goalInput.value = "calm-down";
    modeInput.value = "test";
    categoryInput.value = "recovery";
    notesInput.value = "Calm reset session.";
    setSelectedMood("calm");
  } else if (presetName === "energy-lift") {
    sessionInput.value = "Energy Lift";
    contextInput.value = "gym";
    goalInput.value = "energize";
    modeInput.value = "build";
    categoryInput.value = "energy";
    notesInput.value = "High-energy motivation session.";
    setSelectedMood("hype");
  }

  const recommendation = getRecommendedSource(
    contextInput.value,
    goalInput.value,
    categoryInput.value,
    selectedMood
  );

  recommendedSource.textContent = recommendation.winner;
  recommendationWhy.textContent = buildRecommendationWhy(
    contextInput.value,
    goalInput.value,
    categoryInput.value,
    selectedMood,
    recommendation.winner,
    recommendation.scores
  );
  sessionState.textContent = "Preset Loaded";
  setFeedback("Preset applied.");
}

function updateMusicUI() {
  if (musicConnections.spotify) {
    spotifyStatus.textContent = "Connected — prototype only.";
    spotifyStatus.classList.add("connected");
    spotifyButton.querySelector(".service-action").textContent = "Spotify Connected";
  } else {
    spotifyStatus.textContent = "Not connected — prototype only.";
    spotifyStatus.classList.remove("connected");
    spotifyButton.querySelector(".service-action").textContent = "Connect to Spotify";
  }

  if (musicConnections.appleMusic) {
    appleMusicStatus.textContent = "Connected — prototype only.";
    appleMusicStatus.classList.add("connected");
    appleMusicButton.querySelector(".service-action").textContent = "Apple Music Connected";
  } else {
    appleMusicStatus.textContent = "Not connected — prototype only.";
    appleMusicStatus.classList.remove("connected");
    appleMusicButton.querySelector(".service-action").textContent = "Connect to Apple Music";
  }

  if (musicConnections.soundcloud) {
    soundcloudStatus.textContent = "Connected — prototype only.";
    soundcloudStatus.classList.add("connected");
    soundcloudButton.querySelector(".service-action").textContent = "SoundCloud Connected";
  } else {
    soundcloudStatus.textContent = "Not connected — prototype only.";
    soundcloudStatus.classList.remove("connected");
    soundcloudButton.querySelector(".service-action").textContent = "Connect to SoundCloud";
  }

  connectedServicesCount.textContent = `${getConnectedCount()} / 3`;
  primarySource.textContent = getPrimarySource();
}

function updateDriveModeUI() {
  document.body.classList.toggle("drive-mode", driveMode);
  driveModeButton.textContent = `Drive Mode: ${driveMode ? "On" : "Off"}`;
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateTimerDisplay() {
  timerDisplay.textContent = formatTime(timerSeconds);
}

function startTimer() {
  if (timerInterval) return;

  timerInterval = setInterval(function () {
    timerSeconds += 1;
    updateTimerDisplay();
  }, 1000);

  setFeedback("Timer started.");
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  setFeedback("Timer paused.");
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerSeconds = 0;
  updateTimerDisplay();
  setFeedback("Timer reset.");
}

function getTopValue(key) {
  if (sessionHistory.length === 0) return "-";

  const counts = {};
  sessionHistory.forEach(function (session) {
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

function updateRoutePanelFromLatest() {
  if (sessionHistory.length === 0) {
    sessionState.textContent = "Idle";
    lastCategory.textContent = "-";
    lastMood.textContent = "-";
    sessionScore.textContent = "-";
    recommendedSource.textContent = "-";
    return;
  }

  const latest = sessionHistory[sessionHistory.length - 1];
  sessionState.textContent = "Session Logged";
  lastCategory.textContent = latest.category;
  lastMood.textContent = latest.mood;
  sessionScore.textContent = latest.score;
  recommendedSource.textContent = latest.recommendedSource;
}

function renderHistory() {
  const moodFilterValue = filterMood.value;
  const modeFilterValue = filterMode.value;
  const categoryFilterValue = filterCategory.value;
  const searchValue = searchInput.value.trim().toLowerCase();

  let filteredHistory = sessionHistory.slice();

  if (favoritesOnly) {
    filteredHistory = filteredHistory.filter(session => session.favorite);
  }

  if (moodFilterValue !== "all") {
    filteredHistory = filteredHistory.filter(session => session.mood === moodFilterValue);
  }

  if (modeFilterValue !== "all") {
    filteredHistory = filteredHistory.filter(session => session.mode === modeFilterValue);
  }

  if (categoryFilterValue !== "all") {
    filteredHistory = filteredHistory.filter(session => session.category === categoryFilterValue);
  }

  if (searchValue !== "") {
    filteredHistory = filteredHistory.filter(function (session) {
      return (
        session.sessionName.toLowerCase().includes(searchValue) ||
        session.mode.toLowerCase().includes(searchValue) ||
        session.mood.toLowerCase().includes(searchValue) ||
        session.category.toLowerCase().includes(searchValue) ||
        session.context.toLowerCase().includes(searchValue) ||
        session.goal.toLowerCase().includes(searchValue) ||
        session.rauxType.toLowerCase().includes(searchValue) ||
        (session.notes && session.notes.toLowerCase().includes(searchValue))
      );
    });
  }

  filteredHistory.sort(function (a, b) {
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;
    return b.id - a.id;
  });

  if (filteredHistory.length === 0) {
    historyList.innerHTML = '<p class="empty-history">No sessions match your current filters.</p>';
    updateStats();
    updateRoutePanelFromLatest();
    return;
  }

  historyList.innerHTML = "";

  filteredHistory.forEach(function (session) {
    const card = document.createElement("div");
    card.classList.add("history-card");
    if (session.favorite) {
      card.classList.add("pinned");
    }

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
        <strong>${session.sessionName}</strong>
        <div class="badge-row">
          ${session.favorite ? '<span class="info-badge favorite">★ FAVORITE</span>' : ""}
          ${session.feedback === "good" ? '<span class="info-badge good">GOOD MATCH</span>' : ""}
          ${session.feedback === "bad" ? '<span class="info-badge bad">BAD MATCH</span>' : ""}
          <span class="info-badge">${session.mode.toUpperCase()}</span>
          <span class="info-badge">${session.category.toUpperCase()}</span>
          <span class="info-badge">${session.mood.toUpperCase()}</span>
          <span class="info-badge">${session.context.toUpperCase()}</span>
          <span class="info-badge">${session.goal.toUpperCase()}</span>
          <span class="info-badge">${session.rauxType}</span>
          <span class="info-badge">SCORE ${session.score}</span>
          <span class="info-badge">${session.recommendedSource}</span>
          <span class="info-badge">${session.duration}</span>
        </div>
        ${session.notes ? `Notes: ${session.notes}<br>` : ""}
        Why: ${session.whyRecommendation}<br>
        Spotify: ${session.spotifyConnected ? "Yes" : "No"}<br>
        Apple Music: ${session.appleMusicConnected ? "Yes" : "No"}<br>
        SoundCloud: ${session.soundcloudConnected ? "Yes" : "No"}<br>
        Time: ${session.timestamp}
        <div class="history-card-actions">
          <button class="favorite-button ${session.favorite ? "" : "off"}" data-id="${session.id}" type="button">${session.favorite ? "Unfavorite" : "Favorite"}</button>
          <button class="duplicate-button" data-id="${session.id}" type="button">Duplicate</button>
          <button class="edit-button" data-id="${session.id}" type="button">Edit</button>
          <button class="delete-button" data-id="${session.id}" type="button">Delete</button>
        </div>
      `;
    }

    historyList.appendChild(card);
  });

  attachCardEvents();
  updateStats();
  updateRoutePanelFromLatest();
}

function attachCardEvents() {
  document.querySelectorAll(".favorite-button").forEach(function (button) {
    button.addEventListener("click", function () {
      const id = Number(button.dataset.id);
      sessionHistory = sessionHistory.map(function (session) {
        if (session.id === id) {
          session.favorite = !session.favorite;
        }
        return session;
      });
      saveHistory();
      renderHistory();
      setFeedback("Favorite state updated.");
    });
  });

  document.querySelectorAll(".duplicate-button").forEach(function (button) {
    button.addEventListener("click", function () {
      const id = Number(button.dataset.id);
      const original = sessionHistory.find(session => session.id === id);
      if (!original) return;

      const clone = {
        ...original,
        id: Date.now(),
        sessionName: `${original.sessionName} Copy`,
        timestamp: getTimestamp(),
        isEditing: false,
        favorite: false,
        feedback: ""
      };

      sessionHistory.push(clone);
      saveHistory();
      renderHistory();
      setFeedback("Session duplicated.");
    });
  });

  document.querySelectorAll(".delete-button").forEach(function (button) {
    button.addEventListener("click", function () {
      const confirmed = confirm("Delete this session from history?");
      if (!confirmed) return;

      const id = Number(button.dataset.id);
      lastDeletedSession = sessionHistory.find(session => session.id === id) || null;
      sessionHistory = sessionHistory.filter(session => session.id !== id);
      saveHistory();
      renderHistory();
      undoBanner.classList.remove("hidden");
      setFeedback("Session removed.");
    });
  });

  document.querySelectorAll(".edit-button").forEach(function (button) {
    button.addEventListener("click", function () {
      const id = Number(button.dataset.id);
      sessionHistory.forEach(function (session) {
        session.isEditing = session.id === id;
      });
      renderHistory();
    });
  });

  document.querySelectorAll(".save-edit-button").forEach(function (button) {
    button.addEventListener("click", function () {
      const id = Number(button.dataset.id);
      const input = document.querySelector(`.edit-input[data-id="${id}"]`);
      const newName = input.value.trim();

      if (newName === "") return;

      sessionHistory = sessionHistory.map(function (session) {
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
      setFeedback("Session renamed.");
    });
  });

  document.querySelectorAll(".cancel-edit-button").forEach(function (button) {
    button.addEventListener("click", function () {
      const id = Number(button.dataset.id);
      sessionHistory = sessionHistory.map(function (session) {
        if (session.id === id) {
          session.isEditing = false;
        }
        return session;
      });
      renderHistory();
    });
  });
}

function setSessionFeedback(value) {
  if (!lastCreatedSessionId) return;

  sessionHistory = sessionHistory.map(function (session) {
    if (session.id === lastCreatedSessionId) {
      session.feedback = value;
    }
    return session;
  });

  saveHistory();
  renderHistory();
  setFeedback(value === "good" ? "Marked as a good match." : "Marked as a bad match.");
}

moodButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    setSelectedMood(button.dataset.mood);
  });
});

presetButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    applyPreset(button.dataset.preset);
  });
});

spotifyButton.addEventListener("click", function () {
  musicConnections.spotify = !musicConnections.spotify;
  saveMusicConnections();
  updateMusicUI();
  setFeedback("Spotify prototype state updated.");
});

appleMusicButton.addEventListener("click", function () {
  musicConnections.appleMusic = !musicConnections.appleMusic;
  saveMusicConnections();
  updateMusicUI();
  setFeedback("Apple Music prototype state updated.");
});

soundcloudButton.addEventListener("click", function () {
  musicConnections.soundcloud = !musicConnections.soundcloud;
  saveMusicConnections();
  updateMusicUI();
  setFeedback("SoundCloud prototype state updated.");
});

driveModeButton.addEventListener("click", function () {
  driveMode = !driveMode;
  saveDriveMode();
  updateDriveModeUI();
  setFeedback(`Drive Mode ${driveMode ? "enabled" : "disabled"}.`);
});

timerStartButton.addEventListener("click", startTimer);
timerPauseButton.addEventListener("click", pauseTimer);
timerResetButton.addEventListener("click", resetTimer);

thumbsUpButton.addEventListener("click", function () {
  setSessionFeedback("good");
});

thumbsDownButton.addEventListener("click", function () {
  setSessionFeedback("bad");
});

startButton.addEventListener("click", function () {
  const sessionName = sessionInput.value.trim();
  const context = contextInput.value;
  const goal = goalInput.value;
  const mode = modeInput.value;
  const category = categoryInput.value;
  const notes = notesInput.value.trim();

  if (sessionName === "" || context === "" || goal === "" || mode === "" || category === "" || selectedMood === "") {
    output.textContent = "Please complete session name, context, goal, mode, category, and mood before starting.";
    clearBoxClasses();
    outputBox.classList.add("neutral");
    sessionState.textContent = "Incomplete";
    setFeedback("");
    return;
  }

  const rauxType = getRauxType(selectedMood);
  const recommendation = getRecommendedSource(context, goal, category, selectedMood);
  const recommended = recommendation.winner;
  const whyText = buildRecommendationWhy(context, goal, category, selectedMood, recommended, recommendation.scores);
  const score = getSessionScore(mode, category, selectedMood, recommended, context, goal);
  const boxClass = getBoxClass(rauxType);
  const timestamp = getTimestamp();
  const duration = formatTime(timerSeconds);

  recommendedSource.textContent = recommended;
  sessionScore.textContent = score;
  recommendationWhy.textContent = whyText;

  output.innerHTML = `
    Session: ${sessionName}<br>
    Context: ${context}<br>
    Goal: ${goal}<br>
    Mode: ${mode}<br>
    Category: ${category}<br>
    Mood: ${selectedMood}<br>
    Suggested Raux Type: ${rauxType}<br>
    Recommended Source: ${recommended}<br>
    Session Score: ${score}<br>
    Duration: ${duration}<br>
    ${notes ? `Notes: ${notes}<br>` : ""}
    Spotify: ${musicConnections.spotify ? "Connected (prototype)" : "Not connected"}<br>
    Apple Music: ${musicConnections.appleMusic ? "Connected (prototype)" : "Not connected"}<br>
    SoundCloud: ${musicConnections.soundcloud ? "Connected (prototype)" : "Not connected"}<br>
    Primary Source: ${getPrimarySource()}<br>
    Time: ${timestamp}
  `;

  clearBoxClasses();
  outputBox.classList.add(boxClass);

  const newSession = {
    id: Date.now(),
    sessionName,
    context,
    goal,
    mode,
    category,
    mood: selectedMood,
    notes,
    rauxType,
    recommendedSource: recommended,
    whyRecommendation: whyText,
    score,
    duration,
    spotifyConnected: musicConnections.spotify,
    appleMusicConnected: musicConnections.appleMusic,
    soundcloudConnected: musicConnections.soundcloud,
    timestamp,
    isEditing: false,
    favorite: false,
    feedback: ""
  };

  lastCreatedSessionId = newSession.id;
  sessionHistory.push(newSession);
  saveHistory();
  renderHistory();
  undoBanner.classList.add("hidden");
  setFeedback("Session saved to history.");
});

resetButton.addEventListener("click", function () {
  sessionInput.value = "";
  contextInput.value = "";
  goalInput.value = "";
  modeInput.value = "";
  categoryInput.value = "";
  notesInput.value = "";
  selectedMood = "";

  moodButtons.forEach(button => button.classList.remove("active"));

  output.textContent = "Ready to create your next session.";
  recommendationWhy.textContent = "Complete a session profile to see recommendation logic.";
  clearBoxClasses();
  outputBox.classList.add("neutral");
  sessionState.textContent = "Idle";
  recommendedSource.textContent = "-";
  sessionScore.textContent = "-";
  setFeedback("Session form cleared.");
});

favoritesOnlyButton.addEventListener("click", function () {
  favoritesOnly = !favoritesOnly;
  favoritesOnlyButton.textContent = `Favorites Only: ${favoritesOnly ? "On" : "Off"}`;
  renderHistory();
});

undoDeleteButton.addEventListener("click", function () {
  if (!lastDeletedSession) return;
  sessionHistory.push(lastDeletedSession);
  saveHistory();
  renderHistory();
  undoBanner.classList.add("hidden");
  lastDeletedSession = null;
  setFeedback("Session restored.");
});

clearHistoryButton.addEventListener("click", function () {
  const confirmed = confirm("Are you sure you want to clear all session history?");
  if (!confirmed) return;

  sessionHistory = [];
  saveHistory();
  renderHistory();
  undoBanner.classList.add("hidden");
  setFeedback("Session history cleared.");
});

exportButton.addEventListener("click", function () {
  const data = JSON.stringify(sessionHistory, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "raux-session-history.json";
  link.click();

  URL.revokeObjectURL(url);
  setFeedback("Session history exported successfully.");
});

filterMood.addEventListener("change", renderHistory);
filterMode.addEventListener("change", renderHistory);
filterCategory.addEventListener("change", renderHistory);
searchInput.addEventListener("input", renderHistory);

updateMusicUI();
updateDriveModeUI();
updateTimerDisplay();
renderHistory();
updateStats();
updateRoutePanelFromLatest();
