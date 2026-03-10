const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const appName = "Raux Phase 2";

console.log(`${appName} is running`);

rl.question("What do you want to call this session? ", function(sessionName) {
  rl.question("What mode are we in? ", function(mode) {
    rl.question("What is the mood? ", function(mood) {
      console.log("\n--- Session Summary ---");
      console.log(`App: ${appName}`);
      console.log(`Session: ${sessionName}`);
      console.log(`Mode: ${mode}`);
      console.log(`Mood: ${mood}`);
      rl.close();
    });
  });
});