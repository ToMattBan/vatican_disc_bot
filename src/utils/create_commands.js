const allCommands = require("../commands/index");
const { checkCommand } = require("./check_command");

function createCommands(commandCollection) {  
  allCommands.forEach((command) => {
    if (checkCommand(command))
      commandCollection.set(command.data.name, command);
  });
}

module.exports = { createCommands };
