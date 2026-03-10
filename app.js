const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const appName = "Raux Phase 2";

console.log(`${appName} is running`);

rl.question("What do you want to call this session? ", function(answer) {
  console.log(`Session started: ${answer}`);
  rl.close();
});