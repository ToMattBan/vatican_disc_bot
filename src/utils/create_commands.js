const allCommands = require("../commands/index");
const { checkCommandExists } = require("./check_command");

function createCommands(commandCollection) {
  allCommands.forEach((command) => {
    if (checkCommandExists(command)) {
      commandCollection.set(command.data.name, command);
    }
  });
}

module.exports = { createCommands };
