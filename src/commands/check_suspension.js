const { SlashCommandBuilder, bold } = require("discord.js");
const { storeReader } = require("../utils/storeHandler");
const { checkPermissions } = require("../utils/check_permission");

function cleanOldSuspensions(store) {
  const today = new Date();

  for (let user in store) {
    if (store[user].suspensions.length > 0) {
      store[user].suspensions = store[user].suspensions.filter((suspension) => {
        return today - new Date(suspension.endDate) < 0;
      });
    }
  }

  return store;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("check_suspension")
    .setDescription("Check how many suspensions a user have.")
    .addUserOption((option) =>
      option
        .setName("member")
        .setDescription("The member that you want to check.")
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!checkPermissions(interaction, 'senate')) return;

    const dirtSuspensionStore = await storeReader("suspension");
    const suspensionStore = cleanOldSuspensions(dirtSuspensionStore);

    const target = interaction.options.getUser("member");
    if (target) {
      const targetServer = interaction.guild.members.cache.get(target.id);
      const targetNick = targetServer.nickname ?? target.globalName;

      let message = '';
      
      if (suspensionStore[target.username] && suspensionStore[target.username].suspensions.length > 0) {
        message = `The target ${bold(targetNick)} have ${suspensionStore[target.username].suspensions.length} suspensions:`;
        
        suspensionStore[target.username].suspensions.forEach(suspension => {
          const period = suspension.type.includes("5d") ? "5 days" : "2 weeks";
          message += `\nA ${bold(period)} suspension that ends on ${bold(new Date(suspension.endDate).toISOString().split('T')[0])}`
        })
      } else {
        message = `The user ${bold(targetNick)} don't have any currrent suspensions`;
      }

      await interaction.reply(message);
    } else {
      let allSuspensions = "";
      for (var user in suspensionStore) {
        allSuspensions += `\nThe user ${bold(suspensionStore[user].nickname)} have a total of ${bold(suspensionStore[user].suspensions.length)} suspensions. Check the user alone for more infos`
      }

      await interaction.reply(allSuspensions == "" ? "There is no supension" : allSuspensions);
    }
  },
};
