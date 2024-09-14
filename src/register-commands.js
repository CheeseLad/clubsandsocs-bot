require('dotenv').config();
const { REST, Routes } = require('discord.js');

const commands = [
  {
    name: 'verify',
    description: 'Verify your identity',
    options: [
      {
        name: 'email',
        description: 'Your email address',
        type: 3,
        required: true,
      },
    ],
  },
  {
    name: 'events',
    description: 'Get upcoming events',
    options: [
      {
        name: 'type',
        description: '`club` or `society`',
        type: 3,
        required: true,
      },
      {
        name: 'name',
        description: 'The name of the club or society',
        type: 3,
        required: true,
      },
      {
        name: 'limit',
        description: 'The number of events to show',
        type: 4,
        required: false,
      },
    ],
  },
  {
    name: 'committee',
    description: 'Get the committee members',
    options: [
      {
        name: 'type',
        description: '`club` or `society`',
        type: 3,
        required: true,
      },
      {
        name: 'name',
        description: 'The name of the club or society',
        type: 3,
        required: true,
      },
    ],
  }
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
