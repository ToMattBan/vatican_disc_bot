const { REST, Routes } = require("discord.js");
const dotenv = require("dotenv");
const { checkCommandExists } = require("./utils/check_command");

dotenv.config();

const allCommands = require("./commands/_index");
const commands = allCommands
  .filter(checkCommandExists)
  .map((command) => command.data.toJSON());

const rest = new REST().setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log(`Trying to publish ${commands.length} slash commands`);

    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.APP_ID, process.env.GUILD_ID),
      { body: commands }
    );

    console.log(`Successfully published ${data.length} slash commands`);
  } catch (error) {
    console.error(error);
  }
})();
