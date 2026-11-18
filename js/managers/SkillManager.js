const MathUtil = require('../utils/MathUtil');

const SKILLS = [
  { id: 'horn_big', icon: '角', name: '牛角变大', desc: '撞击范围 +20%', apply: s => { s.mods.hitRange += 0.2; } },
  { id: 'speed_up', icon: '速', name: '奶牛加速', desc: '移动速度 +15%', apply: s => { s.mods.speed += 0.15; } },
  { id: 'magnet', icon: '吸', name: '草币吸吸', desc: '自动吸附近草币和经验', apply: s => { s.mods.magnet += 95; } },
  { id: 'belly', icon: '弹', name: '弹弹牛肚', desc: '撞到大怪眩晕更短', apply: s => { s.mods.stunReduce += 0.35; } },
  { id: 'hay_chain', icon: '连', name: '草垛连锁', desc: '撞飞草垛怪触发范围连锁', apply: s => { s.mods.hayChain = true; } },
  { id: 'shadow', icon: '影', name: '小牛分身', desc: '小牛影子帮忙撞小怪', apply: s => { s.mods.shadow += 1; } },
  { id: 'shield', icon: '盾', name: '花花护盾', desc: '获得一次免撞保护', apply: s => { s.mods.shield += 1; } },
  { id: 'star_dash', icon: '星', name: '星星冲刺', desc: '每隔 8 秒自动冲一下', apply: s => { s.mods.starDash = true; } },
  { id: 'xp_more', icon: '验', name: '经验多多', desc: '获得经验 +20%', apply: s => { s.mods.exp += 0.2; } },
  { id: 'coin_more', icon: '草', name: '草币多多', desc: '草币收益 +20%', apply: s => { s.mods.coin += 0.2; } },
  { id: 'grow_now', icon: '大', name: '变大一点点', desc: '当前体型立即增加', apply: s => { s.mods.instantGrow += 10; } },
  { id: 'cute_rage', icon: '凶', name: '奶凶模式', desc: '10 秒内顶飞更大敌人', apply: s => { s.triggerRage = 10000; } }
];

class SkillManager {
  constructor() {
    this.reset();
  }

  reset() {
    this.owned = [];
    this.mods = {
      hitRange: 0,
      speed: 0,
      magnet: 0,
      stunReduce: 0,
      hayChain: false,
      shadow: 0,
      shield: 0,
      starDash: false,
      exp: 0,
      coin: 0,
      instantGrow: 0
    };
    this.triggerRage = 0;
    this.starTimer = 8000;
    this.shadowTimer = 0;
  }

  getOffer() {
    const pool = SKILLS.filter(s => s.id !== 'hay_chain' || !this.mods.hayChain);
    const picks = [];
    while (picks.length < 3 && picks.length < pool.length) {
      const skill = MathUtil.choose(pool);
      if (!picks.find(s => s.id === skill.id)) picks.push(skill);
    }
    return picks;
  }

  choose(skill) {
    if (!skill) return;
    skill.apply(this);
    this.owned.push(skill);
  }

  getOwned() {
    return this.owned.slice();
  }
}

SkillManager.SKILLS = SKILLS;
module.exports = SkillManager;
