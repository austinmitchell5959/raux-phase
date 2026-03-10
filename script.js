const sessionInput = document.getElementById("sessionInput");
const startButton = document.getElementById("startButton");
const output = document.getElementById("output");

startButton.addEventListener("click", function() {
  const sessionName = sessionInput.value.trim();

  if (sessionName === "") {
    output.textContent = "Please enter a session name.";
    return;
  }

  output.textContent = `Raux Phase 2 started: ${sessionName}`;
});