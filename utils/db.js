const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../data/db.json');
if (!fs.existsSync(path.dirname(file))) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

const adapter = new JSONFile(file);
const defaultData = {};
const db = new Low(adapter, defaultData);

async function getDB() {
  await db.read();
  db.data ||= {};
  db.data._backups ||= {};
  return db;
}

function backupUserData(db, userId) {
  db.data._backups[userId] = JSON.stringify(db.data[userId] || {});
}

function restoreUserData(db, userId) {
  if (!db.data._backups[userId]) {
    return false;
  }
  db.data[userId] = JSON.parse(db.data._backups[userId]);
  delete db.data._backups[userId];
  return true;
}

module.exports = { getDB, backupUserData, restoreUserData };
