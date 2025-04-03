const { SlashCommandBuilder } = require('discord.js');
const { getDB, backupUserData } = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('goal')
    .setDescription('目標体重(kg)を設定します（例: /goal weight:60）')
    .addNumberOption(option =>
      option.setName('weight')
        .setDescription('目標体重 (kg)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const goal = interaction.options.getNumber('weight');
    const db = await getDB();
    const userId = interaction.user.id;

    // --- 変更前にバックアップ ---
    backupUserData(db, userId);

    db.data[userId] ||= { height: null, records: [], meals: {}, goal: null };
    db.data[userId].goal = goal;

    await db.write();
    await interaction.reply(`🎯 目標体重 ${goal}kg を設定しました！`);
  }
};
