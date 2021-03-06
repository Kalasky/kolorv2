const { SlashCommandBuilder } = require('@discordjs/builders')
const fColors = require('../f_colors.json')
const sColors = require('../s_colors.json')
const vsColors = require('../vs_colors.json')

module.exports = {
  data: new SlashCommandBuilder().setName('setup-roles').setDescription('Pick a color!'),
  async execute(interaction) {
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      interaction.reply('You must be an admin to execute this command.')
      return false
    }

    // Prep list of all roles that needs to be setup
    const roleList = [vsColors, sColors, fColors]

    // Find discord role object
    const getRole = (roleString) => {
      let role = interaction.guild.roles.cache.find((data) => {
        return data.name == roleString
      })
      return role
    }

    let roleCreated = [] // this is the container for the roles that is created, meaning its not on discord
    for (let role_list = 0; role_list < roleList.length; role_list++) {
      for (let role_elem = 0; role_elem < roleList[role_list].length; role_elem++) {
        const role = roleList[role_list][role_elem]
        if (!getRole(role['role_name'])) {
          console.log(role['role_name'], 'has just been created!')
          interaction.guild.roles
            .create({
              name: role.role_name,
              color: role.color,
            })
            .then()
            .catch(console.error)
          roleCreated.push(role.role_name)
        }
      }
    }

    let difference = []
    for (let role_list = 0; role_list < roleList.length; role_list++) {
      let roleNames = []
      for (let role_elem = 0; role_elem < roleList[role_list].length; role_elem++) {
        const role = roleList[role_list][role_elem]
        roleNames.push(role.role_name)
      }
      difference.push(roleNames.filter((x) => roleCreated.indexOf(x) === -1))
    }

    let finalDiff = []
    for (let i = 0; i < difference.length; i++) {
      finalDiff.push(...difference[i])
    }

    if (finalDiff.length == 0) {
      interaction.reply('All roles have been created.')
    } else if (roleCreated.length > 0) {
      interaction.reply(`Role \`${finalDiff.toString()}\` already exists and was not created to prevent duplication.`)
    } else {
      interaction.reply('All roles have already been created.')
    }
  },
}
