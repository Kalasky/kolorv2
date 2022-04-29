const { SlashCommandBuilder } = require('@discordjs/builders')
const User = require('../models/user')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Verifies your twitch username')
    .addStringOption((option) =>
      option.setName('input').setDescription('Enter your twitch username').setRequired(true)
    ),
  async execute(interaction) {
    const input = interaction.options.getString('input')

    User.create(
      {
        discordID: interaction.member.id,
        twitch_username: input,
        vs_colors: [],
        s_colors: [],
        f_colors: [],
      },
      function (err, next) {
        // if (err.name === 'MongoServerError' && err.code === 11000) {
        //   interaction.reply('This username or discord account already exists!')
        // }
        if (err) {
          return interaction.reply('This twitch username or discord account already exists!')
        }
        return interaction.reply('Successfuly verified!')
      }
    )
  },
}
