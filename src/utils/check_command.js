function checkCommand(command) {
  if (command && command.data && command.execute) {
    return true;
  } else {
    console.error(
      '[WARNING] The command is missing a required "data" or "execute" property.'
    );

    return false;
  }
}

module.exports = { checkCommand };
