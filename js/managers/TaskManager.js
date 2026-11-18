const Storage = require('../utils/Storage');
const TimeUtil = require('../utils/TimeUtil');
const PlayerData = require('./PlayerDataManager');

const KEY = 'NCC_TASK_DATA';
const POOL = [
  { id: 'play3', title: '玩 3 局', type: 'play', target: 3, reward: { coins: 500 } },
  { id: 'hit50', title: '撞飞 50 个物体', type: 'hit', target: 50, reward: { coins: 500 } },
  { id: 'coin1000', title: '获得 1000 草币', type: 'coin', target: 1000, reward: { coins: 300 } },
  { id: 'energy5', title: '今日消耗 5 点体力', type: 'energyCost', target: 5, reward: { coins: 500 } },
  { id: 'ad1', title: '看广告恢复 1 次体力', type: 'adEnergy', target: 1, reward: { coins: 300 } },
  { id: 'play10', title: '今日玩满 10 局', type: 'play', target: 10, reward: { tickets: 1 } }
];

class TaskManager {
  init(app) {
    this.app = app;
    this.data = Storage.get(KEY, {});
    this.refresh();
  }
  save() { Storage.set(KEY, this.data); }
  refresh() {
    const today = TimeUtil.today();
    if (this.data.date !== today) {
      const offset = new Date().getDate() % POOL.length;
      this.data = { date: today, tasks: [0, 1, 2].map(i => {
        const base = POOL[(offset + i * 2) % POOL.length];
        return Object.assign({}, base, { progress: 0, claimed: false });
      }) };
      this.save();
    }
  }
  getTasks() { this.refresh(); return this.data.tasks; }
  addProgress(type, amount) {
    this.refresh();
    this.data.tasks.forEach(t => { if (t.type === type) t.progress = Math.min(t.target, (t.progress || 0) + amount); });
    this.save();
  }
  claim(id) {
    const t = this.getTasks().find(v => v.id === id);
    if (!t || t.claimed || t.progress < t.target) return false;
    t.claimed = true;
    if (t.reward.coins) PlayerData.addCoins(t.reward.coins);
    if (t.reward.tickets) PlayerData.addEnergyTicket(t.reward.tickets);
    this.save();
    this.app.toast.show('任务奖励已领取');
    return true;
  }
}

module.exports = new TaskManager();
