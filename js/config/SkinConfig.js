module.exports = [
  { id: 'normal', name: '奶团小牛', rarity: '普通', unlockText: '默认拥有', price: 0, bonus: {}, effectText: '软萌基础款，最像奶牛' },
  { id: 'strawberry', name: '草莓牛', rarity: '普通', unlockText: '1500 草币', price: 1500, bonus: {}, effectText: '撞飞时撒草莓粒' },
  { id: 'cloud', name: '云朵牛', rarity: '稀有', unlockText: '3000 草币', price: 3000, bonus: { slowReduce: 0.03 }, effectText: '软绵绵少眩晕' },
  { id: 'pudding', name: '布丁牛', rarity: '稀有', unlockText: '4000 草币', price: 4000, bonus: { coin: 0.03 }, effectText: '焦糖斑点多草币' },
  { id: 'star_pajama', name: '星星睡衣牛', rarity: '稀有', unlockText: '5000 草币', price: 5000, bonus: {}, effectText: '星星睡衣会发光' },
  { id: 'peach', name: '蜜桃牛', rarity: '稀有', unlockText: '6000 草币', price: 6000, bonus: { coin: 0.04 }, effectText: '连击爱心草币香' },
  { id: 'milk_tea', name: '奶茶珍珠牛', rarity: '史诗', unlockText: '8000 草币', price: 8000, bonus: { coin: 0.05 }, effectText: '珍珠弹弹加收益' },
  { id: 'dino', name: '小恐龙牛', rarity: '史诗', unlockText: '10000 草币', price: 10000, bonus: { impact: 0.05 }, effectText: '穿龙衣也还是牛' },
  { id: 'raincoat', name: '雨衣牛', rarity: '史诗', unlockText: '每日任务累计 7 天', price: 0, taskUnlock: true, bonus: { slowReduce: 0.05 }, effectText: '雨天也能稳稳撞' },
  { id: 'panda', name: '熊猫团子牛', rarity: '史诗', unlockText: '12000 草币', price: 12000, bonus: { startSpeed: 0.04 }, effectText: '黑白团子跑得快' },
  { id: 'crown', name: '小皇冠牛', rarity: '传说', unlockText: '付费皮肤占位', price: 0, paid: true, bonus: { coin: 0.08 }, effectText: '皇冠闪闪奖励多' },
  { id: 'rainbow', name: '彩虹牛', rarity: '限定', unlockText: '分享邀请好友占位', price: 0, paid: true, bonus: { sprintSpeed: 0.06 }, effectText: '奶凶彩虹轨迹' }
];
