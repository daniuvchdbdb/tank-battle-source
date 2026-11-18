const Storage = require('../utils/Storage');
const TimeUtil = require('../utils/TimeUtil');
const GameConfig = require('../config/GameConfig');
const PlayerData = require('./PlayerDataManager');

const KEY = 'NCC_ENERGY_DATA';

class EnergyManager {
  init(app) {
    this.app = app;
    const old = Storage.get(KEY, null);
    this.data = old || {
      energy: 20,
      maxEnergy: 10,
      lastRecoverTime: Date.now(),
      todayAdEnergyCount: 0,
      todayDate: TimeUtil.today(),
      newbieGift: true
    };
    this.resetDailyAdCountIfNeeded();
    this.refreshEnergy();
    this.save();
  }
  save() { Storage.set(KEY, this.data); }
  getEnergy() { this.refreshEnergy(); return Math.floor(this.data.energy); }
  getMaxEnergy() { return this.data.maxEnergy || 10; }
  refreshEnergy() {
    if (!this.data) return;
    const max = this.getMaxEnergy();
    if (this.data.energy >= max) { this.data.lastRecoverTime = Date.now(); return; }
    const now = Date.now();
    const count = Math.floor((now - this.data.lastRecoverTime) / GameConfig.ENERGY_RECOVER_MS);
    if (count > 0) {
      this.data.energy = Math.min(max, this.data.energy + count);
      this.data.lastRecoverTime += count * GameConfig.ENERGY_RECOVER_MS;
      if (this.data.energy >= max) this.data.lastRecoverTime = now;
      this.save();
    }
  }
  canStartGame() { return this.getEnergy() > 0; }
  consumeEnergy(amount) {
    amount = amount || 1;
    this.refreshEnergy();
    if (this.data.energy < amount) return false;
    this.data.energy -= amount;
    if (this.data.energy < this.getMaxEnergy() && !this.data.lastRecoverTime) this.data.lastRecoverTime = Date.now();
    this.save();
    return true;
  }
  addEnergy(amount, allowOverCap) {
    this.refreshEnergy();
    this.data.energy = allowOverCap ? this.data.energy + amount : Math.min(this.getMaxEnergy(), this.data.energy + amount);
    if (this.data.energy >= this.getMaxEnergy()) this.data.lastRecoverTime = Date.now();
    this.save();
  }
  setMaxEnergy(max) { this.data.maxEnergy = Math.max(this.getMaxEnergy(), max); this.save(); }
  getNextRecoverTimeText() {
    this.refreshEnergy();
    if (this.data.energy >= this.getMaxEnergy()) return '体力已满';
    return TimeUtil.mmss(GameConfig.ENERGY_RECOVER_MS - (Date.now() - this.data.lastRecoverTime)) + ' 后恢复 1 点';
  }
  resetDailyAdCountIfNeeded() {
    const today = TimeUtil.today();
    if (this.data.todayDate !== today) {
      this.data.todayDate = today;
      this.data.todayAdEnergyCount = 0;
      this.save();
    }
  }
  getTodayAdEnergyCount() { this.resetDailyAdCountIfNeeded(); return this.data.todayAdEnergyCount || 0; }
  watchAdForEnergy() {
    this.resetDailyAdCountIfNeeded();
    if (this.getTodayAdEnergyCount() >= GameConfig.DAILY_AD_ENERGY_LIMIT) {
      this.app.toast.show('今日广告恢复次数已用完');
      return;
    }
    this.app.ad.showRewardedVideo((ok) => {
      if (!ok) { this.app.toast.show('广告播放失败，请稍后再试'); return; }
      this.data.todayAdEnergyCount++;
      this.addEnergy(GameConfig.AD_ENERGY_REWARD);
      this.app.tasks.addProgress('adEnergy', 1);
      this.app.toast.show('小牛站起来啦，体力 +5');
    });
  }
  useEnergyTicket() {
    if (!PlayerData.spendEnergyTicket()) return false;
    this.addEnergy(1);
    return true;
  }
  getEnergyTicketCount() { return PlayerData.getEnergyTicketCount(); }
}

module.exports = new EnergyManager();
