require('dotenv').config()
const fs = require('node:fs')
const { Client, Collection, Intents } = require('discord.js')
const { default: mongoose } = require('mongoose')
const fetch = require('node-fetch')
const client = new Client({ intents: [Intents.FLAGS.GUILDS] })
const tmi = require('tmi.js')
const cron = require('node-cron')

client.commands = new Collection()
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'))

for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  client.commands.set(command.data.name, command)
}

client.once('ready', () => {
  console.log('Ready!')
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return

  const command = client.commands.get(interaction.commandName)

  if (!command) return

  try {
    await command.execute(interaction)
  } catch (error) {
    console.error(error)
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
  }
})

// MONGODB CONNECTION
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('DB CONNECTED'))
  .catch((err) => console.log('DB CONNECTION ERROR: ', err))

// rate limiting
// clears all redeemed rewards that are older than 1 hour
// cron.schedule('*/10 * * * *', () => {
//   fetch(
//     'https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?first=50&broadcaster_id=58606718&reward_id=08d5e2d9-ddd7-4082-bc78-39b06b35cd68&status=UNFULFILLED',
//     {
//       headers: {
//         'client-Id': process.env.TWITCHBOT_CLIENT_ID,
//         Authorization: `Bearer ${process.env.TWITCHBOT_ACCESS_TOKEN}`,
//       },
//     }
//   )
//     .then((res) => res.json())
//     .then((data) => {
//       let reward = data.data

//       // successfully returns the only object that meets the requirement
//       const mapReward = reward.map((rewards) => {
//         const rewardDate = Date.parse(rewards.redeemed_at)
//         let hours = Math.abs(Date.now() - rewardDate) / 36e5

//         function round(value, precision) {
//           const multiplier = Math.pow(10, precision || 0)
//           return Math.round(value * multiplier) / multiplier
//         }

//         rewards.redeemed_at = round(hours, 1)
//         return rewards
//       })

//       const result = mapReward.filter((x) => x.redeemed_at >= 1.0)

//       for (let i = 0; i < result.length; i++) {
//         // console.log(result[i].id)
//         async function fulfillReward() {
//           await fetch(
//             `https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=58606718&reward_id=08d5e2d9-ddd7-4082-bc78-39b06b35cd68&id=${result[i].id}`,
//             {
//               method: 'PATCH',
//               headers: {
//                 'client-Id': process.env.TWITCHBOT_CLIENT_ID,
//                 Authorization: `Bearer ${process.env.TWITCHBOT_ACCESS_TOKEN}`,
//                 'Content-Type': 'application/json',
//               },
//               body: JSON.stringify({
//                 status: 'CANCELED',
//               }),
//             }
//           )
//         }
//         fulfillReward()
//       }
//     })
// })

// fetch custom rewards from specified channel
// async function getCustomRewards() {
//   await fetch('https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=58606718&status=UNFULFILLED', {
//     headers: {
//       Authorization: `Bearer ${process.env.TWITCHBOT_ACCESS_TOKEN}`,
//       'client-Id': process.env.TWITCHBOT_CLIENT_ID,
//     },
//   })
//     .then((res) => res.json())
//     .then((data) => {
//       console.log(data)
//     })
// }
// getCustomRewards()

const options = {
  options: { debug: true },
  connection: { reconnect: true },
  identity: {
    username: 'kolor',
    password: process.env.TMI_AUTH_TOKEN,
  },
  channels: ['kalaskyyy'],
}

const tmiclient = new tmi.client(options)

tmiclient.on('connected', onConnectedHandler)
tmiclient.connect()

function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`)
}

client.login(process.env.DISCORD_TOKEN)
