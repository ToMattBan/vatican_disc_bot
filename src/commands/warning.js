const { SlashCommandBuilder, bold } = require("discord.js");
const { storeReader, storeWritter } = require("../utils/storeHandler");
const { checkPermissions } = require("../utils/check_permission");
const twoWeeksPeriod = 14 * 24 * 60 * 60 * 1000;

function cleanOldWarnings(store) {
  const today = new Date();

  for (let user in store) {
    if (store[user].warnings.length > 0) {
      store[user].warnings = store[user].warnings.filter((warning) => {
        return today - new Date(warning) < twoWeeksPeriod;
      });
    }
  }

  return store;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warning")
    .setDescription("Create a warning for a user.")
    .addUserOption((option) =>
      option
        .setName("member")
        .setDescription("The member that has been warned")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!checkPermissions(interaction, 'senate')) return;

    const dirtWarningStore = await storeReader("warnings");
    const warningStore = cleanOldWarnings(dirtWarningStore);

    const target = interaction.options.getUser("member");
    const targetServer = interaction.guild.members.cache.get(target.id);
    const targetNick = targetServer.nickname ?? target.globalName;

    if (!warningStore[target.username]) {
      warningStore[target.username] = {
        nickname: targetNick,
        warnings: [],
      };
    }

    warningStore[target.username].warnings.push(new Date());
    await storeWritter("warnings", warningStore);

    const totalWarnings = warningStore[target.username].warnings.length;
    const suspensionMessage =
      totalWarnings >= 3 ? "\nThis player should be suspended or kicked" : "";

    await interaction.reply(
      `A warning for ${bold(targetNick)} has been added.` +
        `\nThere is a total of ${bold(totalWarnings + ' warning(s)')} for this player.${suspensionMessage}`
    );
  },
};
