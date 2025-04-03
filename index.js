require('dotenv').config(); // Koyeb上ではなくても良い。ローカル開発用
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');

// ----------------------
// 1) Discord Client
// ----------------------
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// commandsフォルダを読み込み
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  // ----------------------
  // 2) スラッシュコマンド自動登録
  // ----------------------
  try {
    const { REST, Routes } = require('discord.js');
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    // コマンドのJSONを準備
    const commandsJson = client.commands.map(cmd => cmd.data.toJSON());

    // GUILD_ID があれば ギルドコマンド、なければ グローバルコマンド
    if (process.env.GUILD_ID) {
      // Guildコマンド
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commandsJson }
      );
      console.log(`✅ Slash commands registered for GUILD_ID: ${process.env.GUILD_ID}`);
    } else {
      // グローバルコマンド
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commandsJson }
      );
      console.log('✅ Slash commands registered globally (may take up to 1 hour).');
    }
  } catch (err) {
    console.error('スラッシュコマンドの登録に失敗しました：', err);
  }
});

// コマンド実行時
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: '❌ コマンド実行中にエラーが発生しました。', ephemeral: true });
  }
});

// Botログイン
client.login(process.env.DISCORD_TOKEN);

// ----------------------
// 3) ヘルスチェック用のHTTPサーバ
// ----------------------
const app = express();
const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.send('Bot is alive!');
});

app.listen(PORT, () => {
  console.log(`Healthcheck server running on port ${PORT}`);
});
