const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { getDB } = require('../utils/db');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const width = 800;
const height = 400;
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour: 'white' });

module.exports = {
  data: new SlashCommandBuilder()
    .setName('graph')
    .setDescription('体重またはBMIの推移を表示します')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('weight または bmi（例: weight）')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('range')
        .setDescription('1w, 1m, 1y（例: 1m）')
        .setRequired(true)
    ),

  async execute(interaction) {
    const db = await getDB();
    const userId = interaction.user.id;

    db.data[userId] ||= { height: null, records: [], meals: {}, goal: null };
    const records = db.data[userId].records || [];

    const type = interaction.options.getString('type');
    const range = interaction.options.getString('range');

    const now = new Date();
    const mapRange = { '1w': 7, '1m': 30, '1y': 365 };
    const days = mapRange[range];

    if (!days || !['weight', 'bmi'].includes(type)) {
      await interaction.reply('❌ 無効な範囲またはタイプです。例: /graph type:weight range:1m');
      return;
    }

    // 過去 days 日分にフィルタ
    const filtered = records.filter(r => {
      const dateObj = new Date(r.date);
      return (now - dateObj) / (1000 * 60 * 60 * 24) <= days;
    });

    if (filtered.length === 0) {
      await interaction.reply('⚠️ 指定期間にデータがありません。');
      return;
    }

    const config = {
      type: 'line',
      data: {
        labels: filtered.map(r => r.date),
        datasets: [{
          label: (type === 'weight') ? '体重 (kg)' : 'BMI',
          data: filtered.map(r => r[type]),
          borderColor: 'blue',
          borderWidth: 2,
          fill: false,
          tension: 0.1
        }]
      },
      options: {
        scales: {
          x: {
            title: { display: true, text: '日付' }
          },
          y: {
            title: {
              display: true,
              text: (type === 'weight') ? '体重 (kg)' : 'BMI'
            }
          }
        }
      }
    };

    const image = await chartJSNodeCanvas.renderToBuffer(config);
    const attachment = new AttachmentBuilder(image, { name: 'graph.png' });
    await interaction.reply({ files: [attachment] });
  }
};
