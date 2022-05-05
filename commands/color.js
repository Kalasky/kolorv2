const { SlashCommandBuilder } = require('@discordjs/builders')
const fetch = require('node-fetch')
const User = require('../models/user')
const {
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  Message,
  ButtonInteraction,
  Client,
  Intents,
} = require('discord.js')

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES],
})

module.exports = {
  data: new SlashCommandBuilder()
    .setName('color')
    .setDescription('Enter your Twitch username!')
    .addStringOption((option) => option.setName('input').setDescription('Twitch username').setRequired(true)),
  async execute(interaction) {
    const input = interaction.options.getString('input')

    let getRole = (roleString) => {
      // Find discord role object
      let role = interaction.guild.roles.cache.find((data) => {
        return data.name == roleString
      })
      return role
    }

    const discordID = interaction.member.id

    const vsEmbed = async () => {
      const row = new MessageActionRow().addComponents(
        new MessageButton().setCustomId('very slightly red').setLabel('Very Slight Red').setStyle('PRIMARY'),
        new MessageButton().setCustomId('very slightly orange').setLabel('Very Slight Orange').setStyle('PRIMARY'),
        new MessageButton().setCustomId('very slightly yellow').setLabel('Very Slight Yellow').setStyle('PRIMARY'),
        new MessageButton().setCustomId('very slightly green').setLabel('Very Slight Green').setStyle('PRIMARY'),
        new MessageButton().setCustomId('very slightly blue').setLabel('Very Slight Blue').setStyle('PRIMARY')
      )
      const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Some title')
        .setURL('https://discord.js.org')
        .setDescription('Some description here')

      await interaction.channel.send({ content: 'Pong!', ephemeral: true, embeds: [embed], components: [row] })
    }

    client.on('interactionCreate', (interaction) => {
      console.log(interaction)
    })

    function countDocuments(discordID) {
      return new Promise((resolve, reject) => {
        User.countDocuments({ discordID: discordID }, (err, count) => {
          if (count > 0) {
            resolve(count)
          } else {
            reject(interaction.reply('You need to `/verify` yourself!'))
            console.log(err)
          }
        })
      })
    }

    function findOneUser(discordID) {
      return new Promise((resolve, reject) => {
        User.findOne({ discordID: discordID }, (err, user) => {
          resolve(user)
          if (!user) {
            reject(console.log(err))
          }
        })
      })
    }

    async function fetchReq() {
      let after = ''
      do {
        const fetchTwitchRedemptions = async () => {
          const response = await fetch(
            `https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?first=50&broadcaster_id=58606718&reward_id=08d5e2d9-ddd7-4082-bc78-39b06b35cd68&after=${after}&status=UNFULFILLED`,
            {
              headers: {
                'client-Id': process.env.TWITCHBOT_CLIENT_ID,
                Authorization: `Bearer ${process.env.TWITCHBOT_ACCESS_TOKEN}`,
              },
            }
          )
          return await response.json()
        }

        const response = await fetchTwitchRedemptions()
        after = response.pagination.cursor

        const rewards = response.data

        if (rewards.length <= 0) {
          interaction.reply('There are currently no pending redemptions!')
          return
        }

        // This array will have all twitch userredemptions pushed into it
        const allRewards = []

        const fulfillReward = async (rewardID, twitchClientID, twitchAccessToken) => {
          await fetch(
            `https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=58606718&reward_id=08d5e2d9-ddd7-4082-bc78-39b06b35cd68&id=${rewardID}`,
            {
              method: 'PATCH',
              headers: {
                'client-Id': twitchClientID,
                Authorization: `Bearer ${twitchAccessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                status: 'FULFILLED',
              }),
            }
          )
        }

        // looping over reward returned data
        for (let i = 0; i < rewards.length; i++) {
          allRewards.push(rewards[i])
        }

        // result variable is destructuring and returning the object that contains the inputted name from the user
        const result = allRewards.find(({ user_name }) => user_name == input.toLowerCase())

        // If  TypeError: cannot find user_name of undefined 
        if (typeof result === 'undefined') {
          return interaction.reply(`The Twitch user **${input}** has not redeemed the channel reward!`)
        }

        const currentName = result.user_name
        const currentRewardID = result.id

        if (currentName === input.toLowerCase()) {
          countDocuments(discordID)
            .then(() => {
              return findOneUser(discordID)
            })
            .then(() => {
              fulfillReward(currentRewardID, process.env.TWITCHBOT_CLIENT_ID, process.env.TWITCHBOT_ACCESS_TOKEN)
              vsEmbed()
            })
            .catch((err) => console.log(err))
          break
        } else if (currentName != input.toLowerCase()) {
          return interaction.reply(`The Twitch user **${input}** has not redeemed the channel reward!`)
        }
      } while (after != undefined)
    }
    return fetchReq()
  },
}
