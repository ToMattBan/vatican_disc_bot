const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const dotenv = require("dotenv");
const { createCommands } = require("./utils/create_commands");

/* Guild == Server */
dotenv.config();
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();
createCommands(client.commands);

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    const reply = {
      content: "There was an error while executing this command!",
      ephemeral: true,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
});

client.login(process.env.BOT_TOKEN);
