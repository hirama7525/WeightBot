const { SlashCommandBuilder } = require('discord.js');
const { getDB, backupUserData } = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('weight')
    .setDescription('今日の体重を記録（例: /weight value:60）')
    .addNumberOption(option =>
      option.setName('value').setDescription('体重 (kg)').setRequired(true)),

  async execute(interaction) {
    const weight = interaction.options.getNumber('value');
    const db = await getDB();
    const userId = interaction.user.id;
    const today = new Date().toISOString().split('T')[0];

    backupUserData(db, userId);

    db.data[userId] ||= { height: null, records: [], meals: {}, goal: null };
    const userData = db.data[userId];

    if (!userData.height) {
      await interaction.reply('⚠️ 体重を記録する前に `/register height:170` で身長を登録してください。');
      return;
    }

    const bmi = +(weight / ((userData.height / 100) ** 2)).toFixed(2);
    userData.records.push({ date: today, weight, bmi });

    const goal = userData.goal;
    const achieved = goal && weight <= goal;

    await db.write();
    await interaction.reply(`✅ ${today} の体重 ${weight}kg、BMI ${bmi} を記録しました。`);
    if (achieved) {
      await interaction.followUp('🎉 おめでとうございます！目標体重を達成しました！');
    }
  }
};
