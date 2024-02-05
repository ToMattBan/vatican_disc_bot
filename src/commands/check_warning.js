const { SlashCommandBuilder, bold } = require("discord.js");
const { storeReader } = require("../utils/storeHandler");
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
    .setName("check_warning")
    .setDescription("Check how many warnings a user have.")
    .addUserOption((option) =>
      option
        .setName("member")
        .setDescription("The member that you want to check.")
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!checkPermissions(interaction, 'senate')) return;

    const dirtWarningStore = await storeReader("warnings");
    const warningStore = cleanOldWarnings(dirtWarningStore);

    const target = interaction.options.getUser("member");
    if (target) {
      const targetServer = interaction.guild.members.cache.get(target.id);
      const targetNick = targetServer.nickname ?? target.globalName;

      const totalWarnings =
        warningStore[target.username]?.warnings?.length || 0;

      await interaction.reply(
        `There is a total of ${bold(
          totalWarnings + " warning(s)"
        )} for ${targetNick}.`
      );
    } else {
      let allWarnings = "";
      for (var user in warningStore) {
        allWarnings += `\nThe user ${bold(warningStore[user].nickname)} have a total of ${bold(warningStore[user].warnings.length)} warnings`
      }

      await interaction.reply(allWarnings);
    }
  },
};
