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

// interactions
client.on('interactionCreate', async interaction => {

  // 🔘 buttons
  if (interaction.isButton()) {
    const data = JSON.parse(fs.readFileSync('./data.json'));

    data.clicks[interaction.customId] =
      (data.clicks[interaction.customId] || 0) + 1;

    fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));

    if (interaction.customId === "bookmark") {
      return interaction.reply({ content: "🔖 Saved!", ephemeral: true });
    }

    if (interaction.customId === "read_more") {
      return interaction.reply({
        content: `📊 Clicks: ${data.clicks.read_more || 0}`,
        ephemeral: true
      });
    }

    return interaction.reply({ content: "Tracked", ephemeral: true });
  }

  if (!interaction.isChatInputCommand()) return;

  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;

  await cmd.execute(interaction);
});

// load cron jobs
client.once('ready', () => {
  console.log('🚀 Bot Ready');

  const data = JSON.parse(fs.readFileSync('./data.json'));

  data.cronJobs.forEach(job => {
    cron.schedule(job.pattern, async () => {
      const channel = client.channels.cache.get(job.channel);
      if (!channel) return;

      channel.send({
        content: job.ping || "",
        embeds: [job.embed]
      });
    });
  });
});

client.login(process.env.TOKEN);
