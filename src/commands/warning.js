const { SlashCommandBuilder, bold } = require("discord.js");

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
    const senateId = "1197202319641677884";
    if (!interaction.member.roles.cache.has(senateId)) {
      await interaction.reply({
        content: "You don't have the permission execute this command",
        ephemeral: true,
      });

      return;
    }

    const target = interaction.options.getUser("member");
    const targetServer = interaction.guild.members.cache.get(target.id);
    const targetNick = bold(targetServer.nickname);

    await interaction.reply(`A warning for ${targetNick} has been added`);
  },
};
