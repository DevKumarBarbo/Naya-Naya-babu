const { REST, Routes } = require('discord.js');
const fs = require('fs');

const cmds = [];
fs.readdirSync('./commands').forEach(f => {
  cmds.push(require('./commands/' + f).data.toJSON());
});

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID),
    { body: cmds }
  );
})();
