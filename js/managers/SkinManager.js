const Storage = require('../utils/Storage');
const SkinConfig = require('../config/SkinConfig');
const PlayerData = require('./PlayerDataManager');

const KEY = 'NCC_SKIN_DATA';

class SkinManager {
  init(app) {
    this.app = app;
    this.data = Object.assign({ owned: ['normal'], current: 'normal', trials: {} }, Storage.get(KEY, {}));
    if (!this.data.owned.includes('normal')) this.data.owned.push('normal');
    const validIds = SkinConfig.map(s => s.id);
    this.data.owned = this.data.owned.filter(id => validIds.includes(id));
    if (!this.data.owned.includes('normal')) this.data.owned.push('normal');
    Object.keys(this.data.trials || {}).forEach(id => {
      if (!validIds.includes(id)) delete this.data.trials[id];
    });
    if (!validIds.includes(this.data.current)) this.data.current = 'normal';
    this.save();
  }
  save() { Storage.set(KEY, this.data); }
  getAllSkins() { return SkinConfig; }
  getCurrentSkin() { return this.getSkin(this.data.current) ? this.data.current : 'normal'; }
  getOwnedSkins() { return this.data.owned.slice(); }
  getSkin(id) { return SkinConfig.find(s => s.id === id); }
  isOwned(id) { return this.data.owned.includes(id) || (this.data.trials[id] || 0) > 0; }
  unlockSkin(id, free) {
    const skin = this.getSkin(id);
    if (!skin) return false;
    if (this.data.owned.includes(id)) return true;
    if (!free && skin.price && !PlayerData.spendCoins(skin.price)) return false;
    this.data.owned.push(id);
    this.save();
    if (this.app) this.app.toast.show('解锁成功：' + skin.name);
    return true;
  }
  addTrial(id, count) { if (!this.getSkin(id)) return; this.data.trials[id] = (this.data.trials[id] || 0) + count; this.save(); }
  consumeTrialIfNeeded() {
    const id = this.getCurrentSkin();
    if (!this.data.owned.includes(id) && this.data.trials[id] > 0) {
      this.data.trials[id]--;
      if (this.data.trials[id] <= 0) this.data.current = 'normal';
      this.save();
    }
  }
  useSkin(id) {
    if (!this.getSkin(id) || !this.isOwned(id)) return false;
    this.data.current = id;
    this.save();
    return true;
  }
  canUnlockSkin(id) {
    const skin = this.getSkin(id);
    if (!skin || skin.paid || skin.taskUnlock || skin.statUnlock) return false;
    return PlayerData.getCoins() >= (skin.price || 0);
  }
  getSkinBonus(type) {
    const skin = this.getSkin(this.getCurrentSkin()) || {};
    return (skin.bonus && skin.bonus[type]) || 0;
  }
}

module.exports = new SkinManager();
