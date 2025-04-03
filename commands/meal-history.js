const { SlashCommandBuilder } = require('discord.js');
const { getDB } = require('../utils/db');

function parseDate(input) {
  const d = new Date(input);
  return isNaN(d) ? null : new Date(d.toISOString().split('T')[0]);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meal-history')
    .setDescription('直近7日間の食事履歴を表示'),

  async execute(interaction) {
    const db = await getDB();
    const userId = interaction.user.id;

    db.data[userId] ||= { height: null, records: [], meals: {}, goal: null };
    const meals = db.data[userId].meals || {};

    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - 6);

    const filtered = Object.entries(meals).filter(([dateStr]) => {
      const dateObj = parseDate(dateStr);
      return dateObj && dateObj >= from && dateObj <= now;
    });

    if (filtered.length === 0) {
      await interaction.reply('🍽️ 直近7日間の食事履歴がありません。');
      return;
    }

    const sorted = filtered.sort(([a],[b]) => new Date(a) - new Date(b));

    const message = sorted.map(([date, mealArray]) => {
      if (!Array.isArray(mealArray)) mealArray = [mealArray];
      const items = mealArray.map(m => {
        if (typeof m === 'string') return `- ${m}`;
        return `- ${m.content}（${m.time}）`;
      }).join('\n');
      return `📅 ${date}\n${items}`;
    }).join('\n\n');

    await interaction.reply(`📋 直近7日間の食事履歴:\n${message}`);
  }
};
