const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const fs = require('fs');
const path = require('path');

// データ保存用のファイル
const file = path.join(__dirname, '../data/db.json');
if (!fs.existsSync(path.dirname(file))) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

// LowDBアダプタの設定
const adapter = new JSONFile(file);
// defaultDataは空オブジェクトに
const defaultData = {};
const db = new Low(adapter, defaultData);

// DBを読み込む関数
async function getDB() {
  await db.read();
  db.data ||= {};
  // _backups プロパティを用意（undo 用）
  db.data._backups ||= {};
  return db;
}

// ユーザーデータをバックアップ
function backupUserData(db, userId) {
  db.data._backups[userId] = JSON.stringify(db.data[userId] || {});
}

// バックアップを復元
function restoreUserData(db, userId) {
  if (!db.data._backups[userId]) {
    return false; // バックアップが存在しない
  }
  db.data[userId] = JSON.parse(db.data._backups[userId]);
  delete db.data._backups[userId];
  return true;
}

module.exports = {
  getDB,
  backupUserData,
  restoreUserData
};
