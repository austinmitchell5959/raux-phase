const readline = require("readline");

const rl = readline.createInterface({
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