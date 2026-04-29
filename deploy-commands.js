const { REST, Routes } = require('discord.js');
const fs = require('fs');

const cmds = [];
const files = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));

for (const f of files) {
  const c = require(`./commands/${f}`);
  cmds.push(c.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID),
    { body: cmds }
  );
  console.log("Deployed");
})();

