const { SlashCommandBuilder } = require('discord.js');
const { getDB, restoreUserData } = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('undo')
    .setDescription('直近の操作を1回だけ取り消します'),

  async execute(interaction) {
    const db = await getDB();
    const userId = interaction.user.id;

    // バックアップを復元
    const success = restoreUserData(db, userId);
    if (!success) {
      await interaction.reply('⚠️ 取り消せる操作がありません。');
      return;
    }

    await db.write();
    await interaction.reply('↩️ 直近の操作を取り消しました。');
  }
};
