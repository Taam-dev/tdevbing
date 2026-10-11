const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'database.json');

function ensureDbFile() {
  if (!fs.existsSync(DB_PATH)) {
    const defaultData = [
      { id: 1, name: 'Account 1', status: 'idle', lastRun: null, lastPoints: 0 }
    ];
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}

function getAccounts() {
  try {
    ensureDbFile();
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Error reading database.json:', error);
    return [];
  }
}

function saveAccounts(accounts) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(accounts, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving database.json:', error);
    return false;
  }
}

function getAccountById(id) {
  const accounts = getAccounts();
  return accounts.find(acc => acc.id === Number(id));
}

function addAccount(name) {
  const accounts = getAccounts();
  const maxId = accounts.reduce((max, acc) => (acc.id > max ? acc.id : max), 0);
  const newAccount = {
    id: maxId + 1,
    name: name || `Account ${maxId + 1}`,
    status: 'idle',
    lastRun: null,
    lastPoints: 0,
    earnedToday: 0
  };
  accounts.push(newAccount);
  saveAccounts(accounts);
  return newAccount;
}

function updateAccount(id, partial) {
  const accounts = getAccounts();
  const index = accounts.findIndex(acc => acc.id === Number(id));
  if (index === -1) return null;
  accounts[index] = { ...accounts[index], ...partial };
  saveAccounts(accounts);
  return accounts[index];
}

function deleteAccount(id) {
  const accounts = getAccounts();
  const filtered = accounts.filter(acc => acc.id !== Number(id));
  saveAccounts(filtered);
  return filtered;
}

module.exports = {
  getAccounts,
  getAccountById,
  addAccount,
  updateAccount,
  deleteAccount
};
