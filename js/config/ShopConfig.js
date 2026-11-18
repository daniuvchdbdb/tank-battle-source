module.exports = [
  { productId: 'energy_small', name: '小份体力包', tag: '轻松续航', price: 6, desc: '30 点体力', rewards: { energy: 30 } },
  { productId: 'energy_medium', name: '中份体力包', tag: '性价比高', price: 12, desc: '80 点体力', rewards: { energy: 80 } },
  { productId: 'sprint_pack', name: '乱撞补给包', tag: '今日热卖', price: 18, desc: '150 点体力 + 3000 草币 + 彩虹牛体验券', rewards: { energy: 150, coins: 3000, trialSkin: 'rainbow' } },
  { productId: 'monthly_card', name: '月卡', tag: '每日领取', price: 12, desc: '每天 20 点体力 + 1000 草币', rewards: { monthlyCard: true } },
  { productId: 'energy_limit_pack', name: '永久体力上限包', tag: '长期推荐', price: 18, desc: '最大体力从 10 提升到 15', rewards: { maxEnergy: 15 } },
  { productId: 'starter_pack', name: '新手礼包', tag: '新手推荐', price: 6, desc: '草莓牛体验券 + 2000 草币 + 30 点体力', rewards: { energy: 30, coins: 2000, trialSkin: 'strawberry' } },
  { productId: 'no_ads', name: '永久去广告', tag: '清爽体验', price: 18, desc: '去除部分插屏广告，激励视频仍可自愿观看', rewards: { noAds: true } },
  { productId: 'battle_pass', name: '战令占位', tag: '限定外观', price: 18, desc: '任务奖励升级，限定皮肤占位', rewards: { battlePass: true } }
];
