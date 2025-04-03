const { SlashCommandBuilder } = require('discord.js');
const { getDB } = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('history')
    .setDescription('直近の体重記録を表示'),

  async execute(interaction) {
    const db = await getDB();
    const userId = interaction.user.id;

    db.data[userId] ||= { height: null, records: [], meals: {}, goal: null };
    const records = db.data[userId].records || [];

    if (records.length === 0) {
      await interaction.reply('📭 記録が見つかりません。');
      return;
    }

    const latest = records.slice(-10).reverse().map(r =>
      `${r.date}: ${r.weight}kg (BMI: ${r.bmi})`
    ).join('\n');

    await interaction.reply(`📋 直近の体重記録:\n${latest}`);
  }
};
