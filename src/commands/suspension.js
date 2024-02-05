const { SlashCommandBuilder, bold } = require("discord.js");
const { storeReader, storeWritter } = require("../utils/storeHandler");
const { checkPermissions } = require("../utils/check_permission");

const fiveDaysPeriod = 5 * 24 * 60 * 60 * 1000;
const twoWeeksPeriod = 14 * 24 * 60 * 60 * 1000;

function setEndDate(period) {
  const today = new Date();
  return new Date(today.getTime() + (period === "5d" ? fiveDaysPeriod : twoWeeksPeriod));
}

function cleanOldSuspensions(store) {
  const today = new Date();

  for (let user in store) {
    if (store[user].suspensions.length > 0) {
      store[user].suspensions = store[user].suspensions.filter((suspension) => {
        return today - new Date(suspension.endDate) >= 0;
      });
    }
  }

  return store;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("suspension")
    .setDescription("Create a suspension for a user.")
    .addUserOption((option) =>
      option
        .setName("member")
        .setDescription("The member that has been suspended")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("The type of the suspension.")
        .setRequired(true)
        .addChoices(
          { name: "Commisions - 5 Days", value: "5d_coms" },
          { name: "Commisions - 2 Weeks", value: "2w_coms" },
          { name: "Letters of Recommendation - 2 Weeks", value: "2w_letters" },
          {
            name: "Sent to Secondary Guild - 2 Weeks",
            value: "2w_secondary_guild",
          }
        )
    ),

  async execute(interaction) {
    if (!checkPermissions(interaction, "senate")) return;

    const dirtSuspensionStore = await storeReader("suspension");
    const suspensionStore = cleanOldSuspensions(dirtSuspensionStore);

    const suspensionType = interaction.options.getString("type");

    const target = interaction.options.getUser("member");
    const targetServer = interaction.guild.members.cache.get(target.id);
    const targetNick = targetServer.nickname ?? target.globalName;

    if (!suspensionStore[target.username]) {
      suspensionStore[target.username] = {
        nickname: targetNick,
        suspensions: [],
      };
    }

    suspensionStore[target.username].suspensions.push({
      startDate: new Date(),
      endDate: setEndDate(suspensionType.includes("5d") ? "5d" : "2w"),
      type: suspensionType,
    });
    await storeWritter("suspension", suspensionStore);

    const period = suspensionType.includes("5d") ? "5 days" : "2 weeks";

    await interaction.reply(
      `A ${period} suspension had been added for ${bold(targetNick)}`
    );
  },
};
