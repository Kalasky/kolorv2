require('dotenv').config()
const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder().setName('help').setDescription('Command Information'),
  async execute(interaction) {
    const initialPromptEmbed = new MessageEmbed()
      .setColor('#00C5CD')
      .setTitle('Help Menu')
      .addFields(
        {
          name: '>verify',
          value:
            "- This confirms that it's actually your Twitch account, and prevents identity fraud.\n- Make sure you have your Twitch connected to your discord account!\n- You do not need to display the connection on your profile.\nIf you changed your name or want to use a different account, reconnect the new Twitch account to your Discord account and re-verify yourself.",
        },
        {
          name: '>color twitch_username',
          value:
            '- Once you have verified your account with the >verify command, run this command to get your colors!\n- For example, if your twitch username is kalaskyyy then you would run `>color kalaskyyy`.\n- Your username is not case-sensitive.',
        },
        {
          name: '>scan',
          value:
            '- Only server admins can run this command.\n- Scans all verified users untracked color roles and logs them in the database.',
        },
        {
          name: '>setup-roles',
          value:
            '- Only server admins can run this command. Creates all required color roles in the Discord server.',
        }
      )
      .setTimestamp()

    await interaction.reply({ embeds: [initialPromptEmbed] })
  },
}
