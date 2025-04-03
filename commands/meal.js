const { SlashCommandBuilder } = require('discord.js');
const { getDB, backupUserData } = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meal')
    .setDescription('今日の食事を記録（例: /meal content:カレー）')
    .addStringOption(option =>
      option.setName('content').setDescription('食べたもの').setRequired(true)),

  async execute(interaction) {
    const content = interaction.options.getString('content');
    const db = await getDB();
    const userId = interaction.user.id;

    backupUserData(db, userId);

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(':').slice(0,2).join(':');

    db.data[userId] ||= { height: null, records: [], meals: {}, goal: null };
    db.data[userId].meals ||= {};
    db.data[userId].meals[today] ||= [];
    db.data[userId].meals[today].push({ content, time });

    await db.write();
    await interaction.reply(`🍽️ ${today} の食事を記録しました：${content}（${time}）`);
  }
};
