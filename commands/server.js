const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
  data: new SlashCommandBuilder().setName('server').setDescription('Server info'),
  async execute(interaction) {
    await interaction.reply(
      `Created on: ${interaction.guild.createdAt}\nVerification level: ${interaction.guild.verificationLevel}`
    )
  },
}
