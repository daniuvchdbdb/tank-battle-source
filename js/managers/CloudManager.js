const PlayerData = require('./PlayerDataManager');

class CloudManager {
  init(app) { this.app = app; }
  uploadScore(score) { this.lastScore = score; }
  getRankList() {
    return [
      { name: '乱撞达人', score: 1680 },
      { name: '草垛终结者', score: 1320 },
      { name: '奶牛吃草王', score: 980 },
      { name: '我', score: PlayerData.getBestDistance() },
      { name: '慢热小牛', score: 520 }
    ].sort((a, b) => b.score - a.score);
  }
  getMyRank() {
    const list = this.getRankList();
    return list.findIndex(v => v.name === '我') + 1;
  }
}

module.exports = new CloudManager();
