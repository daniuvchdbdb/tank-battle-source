const Storage = require('../utils/Storage');
const GameConfig = require('../config/GameConfig');

const KEY = 'NCC_PLAYER_DATA';

class PlayerDataManager {
  init() {
    const defaults = {
      coins: 0,
      bestDistance: 0,
      totalGames: 0,
      totalHits: 0,
      totalPoopHits: 0,
      energyTickets: 0,
      upgrades: { horn: 1, hoof: 1, belly: 1, luck: 1, coinRate: 1 },
      guide: { wrongedTrialGiven: false },
      monthlyCard: { active: false, lastClaimDate: '' },
      noAds: false,
      battlePass: false
    };
    this.data = Object.assign(defaults, Storage.get(KEY, {}));
    this.data.upgrades = Object.assign(defaults.upgrades, this.data.upgrades || {});
    this.save();
  }

  save() { Storage.set(KEY, this.data); }
  getCoins() { return this.data.coins || 0; }
  addCoins(v) { this.data.coins = Math.max(0, this.getCoins() + Math.floor(v)); this.save(); }
  spendCoins(v) { if (this.getCoins() < v) return false; this.data.coins -= v; this.save(); return true; }
  getBestDistance() { return this.data.bestDistance || 0; }
  setBestDistance(v) { this.data.bestDistance = Math.max(this.getBestDistance(), Math.floor(v)); this.save(); }
  getUpgradeLevel(key) { return this.data.upgrades[key] || 1; }
  getUpgradeCost(key) {
    const cfg = GameConfig.UPGRADES.find(u => u.key === key);
    const lv = this.getUpgradeLevel(key);
    return Math.floor((cfg ? cfg.baseCost : 200) * Math.pow(1.42, lv - 1));
  }
  upgrade(key) {
    const cost = this.getUpgradeCost(key);
    if (!this.spendCoins(cost)) return false;
    this.data.upgrades[key] = this.getUpgradeLevel(key) + 1;
    this.save();
    return true;
  }
  addEnergyTicket(n) { this.data.energyTickets = (this.data.energyTickets || 0) + n; this.save(); }
  spendEnergyTicket() { if ((this.data.energyTickets || 0) <= 0) return false; this.data.energyTickets--; this.save(); return true; }
  getEnergyTicketCount() { return this.data.energyTickets || 0; }
  recordGame(result) {
    this.data.totalGames++;
    this.data.totalHits += result.hits || 0;
    this.data.totalPoopHits += result.poopHits || 0;
    this.setBestDistance(result.distance || 0);
    this.save();
  }
  getTotalGames() { return this.data.totalGames || 0; }
  getTotalHits() { return this.data.totalHits || 0; }
  getTotalPoopHits() { return this.data.totalPoopHits || 0; }
  markWrongedTrialGiven() { this.data.guide.wrongedTrialGiven = true; this.save(); }
  hasWrongedTrialGiven() { return !!this.data.guide.wrongedTrialGiven; }
  setFlag(key, value) { this.data[key] = value; this.save(); }
}

module.exports = new PlayerDataManager();
