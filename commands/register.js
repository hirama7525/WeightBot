const { SlashCommandBuilder } = require('discord.js');
const { getDB, backupUserData } = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('身長(cm)を登録します（例: /register height:170）')
    .addNumberOption(option =>
      option.setName('height')
        .setDescription('身長 (cm)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const height = interaction.options.getNumber('height');
    const db = await getDB();
    const userId = interaction.user.id;

    // --- 変更前にバックアップ ---
    backupUserData(db, userId);

    // デフォルト構造がなければ初期化
    db.data[userId] ||= { height: null, records: [], meals: {}, goal: null };
    db.data[userId].height = height;

    await db.write();

    await interaction.reply(`✅ 身長 ${height}cm を登録しました！`);
  }
};
