const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const cron = require('node-cron');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);

// load commands
const files = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
for (const f of files) {
  const cmd = require(`./commands/${f}`);
  client.commands.set(cmd.data.name, cmd);
}

// buttons
client.on('interactionCreate', async interaction => {

  if (interaction.isButton()) {
    const data = JSON.parse(fs.readFileSync('./data.json'));

    data.clicks[interaction.customId] =
      (data.clicks[interaction.customId] || 0) + 1;

    fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));

    return interaction.reply({
      content: `📊 Clicks: ${data.clicks[interaction.customId]}`,
      ephemeral: true
    });
  }

  if (!interaction.isChatInputCommand()) return;

  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;

  await cmd.execute(interaction);
});

// load schedules
client.once('ready', () => {
  console.log('🔥 NIF ULTRA ONLINE');

  const data = JSON.parse(fs.readFileSync('./data.json'));

  data.schedules.forEach(job => {
    cron.schedule(job.pattern, async () => {
      const channel = client.channels.cache.get(job.channel);
      if (!channel) return;

      channel.send(job.payload);
    });
  });
});

client.login(process.env.TOKEN);
