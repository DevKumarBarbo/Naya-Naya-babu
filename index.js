const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const cron = require('node-cron');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// load commands
require('fs').readdirSync('./commands').forEach(f => {
  const cmd = require('./commands/' + f);
  client.commands.set(cmd.data.name, cmd);
});

// interaction handler
client.on('interactionCreate', async interaction => {

  // BUTTONS
  if (interaction.isButton()) {
    const data = JSON.parse(fs.readFileSync('./data.json'));

    data.clicks[interaction.customId] =
      (data.clicks[interaction.customId] || 0) + 1;

    fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));

    if (interaction.customId === "bookmark")
      return interaction.reply({ content: "🔖 Saved", ephemeral: true });

    if (interaction.customId === "stats")
      return interaction.reply({
        content: `📊 ${JSON.stringify(data.clicks, null, 2)}`,
        ephemeral: true
      });
  }

  if (!interaction.isChatInputCommand()) return;

  const cmd = client.commands.get(interaction.commandName);
  if (cmd) await cmd.execute(interaction, client);
});

// LOAD SCHEDULES
client.once('ready', () => {
  console.log("🚀 SYSTEM LIVE");

  const data = JSON.parse(fs.readFileSync('./data.json'));

  data.schedules.forEach(s => {
    cron.schedule(s.pattern, async () => {
      const ch = client.channels.cache.get(s.channel);
      if (ch) ch.send(s.payload);
    });
  });
});

client.login(process.env.TOKEN);
