async function checkPermissions(interaction, permission) {
  const senateId = "1197202319641677884";
  const permissionId = permission == "senate" ? senateId : "";

  if (!interaction.member.roles.cache.has(permissionId)) {
    await interaction.reply({
      content: "You don't have the permission execute this command",
      ephemeral: true,
    });

    return false;
  }

  return true;
}

module.exports = { checkPermissions };
