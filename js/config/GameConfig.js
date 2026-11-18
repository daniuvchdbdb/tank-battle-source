const Theme = require('./Theme');

module.exports = {
  VERSION: '奶牛大乱撞 v0.2.0',
  ENERGY_RECOVER_MS: 10 * 60 * 1000,
  DAILY_AD_ENERGY_LIMIT: 5,
  AD_ENERGY_REWARD: 5,
  COLORS: {
    cream: Theme.colors.cream2,
    cream2: Theme.colors.cream,
    cream3: Theme.colors.cream3,
    sky: Theme.colors.sky,
    sky2: Theme.colors.sky2,
    grass: Theme.colors.grass2,
    grassLight: Theme.colors.grass,
    grassDark: Theme.colors.grass3,
    orange: Theme.colors.orange,
    orangeLight: Theme.colors.orange2,
    orangeDark: Theme.colors.orange3,
    pink: Theme.colors.pink,
    pinkLight: Theme.colors.pink2,
    green: Theme.colors.green,
    greenLight: Theme.colors.green2,
    blue: Theme.colors.blue,
    purple: Theme.colors.purple,
    text: Theme.colors.coffee,
    brown: Theme.colors.caramel,
    white: Theme.colors.white,
    stroke: Theme.colors.coffee,
    shadow: Theme.colors.shadow,
    shadowStrong: Theme.colors.shadowStrong,
    tea: Theme.colors.tea,
    lavender: Theme.colors.lavender
  },
  UPGRADES: [
    { key: 'horn', name: '牛角强度', desc: '更容易撞飞大一点的捣蛋怪', baseCost: 180 },
    { key: 'hoof', name: '牛蹄速度', desc: '拖动移动速度提升', baseCost: 220 },
    { key: 'belly', name: '牛肚弹性', desc: '撞到大怪时眩晕更短', baseCost: 200 },
    { key: 'luck', name: '幸运草', desc: '地图奖励收益更香', baseCost: 260 },
    { key: 'coinRate', name: '金币倍率', desc: '每局草币收益提升', baseCost: 300 }
  ],
  OBSTACLES: {
    hay: { label: '草垛', coin: 18, slow: 0.04 },
    goldenHay: { label: '金草垛', coin: 80, slow: 0.02 },
    box: { label: '木箱', coin: 28, slow: 0.08 },
    stone: { label: '石头', coin: 5, slow: 0.34 },
    spring: { label: '弹簧', coin: 12, boost: 190 },
    poop: { label: '便便怪', coin: 45, boost: 70 },
    chest: { label: '宝箱', coin: 120, slow: 0.03 }
  }
};
