const Button = require('../ui/Button');
const CowSkinRenderer = require('../renderers/CowSkinRenderer');
const DrawUtil = require('../utils/DrawUtil');
const Particle = require('../entities/Particle');
const GameConfig = require('../config/GameConfig');
const PlayerData = require('../managers/PlayerDataManager');

class ResultScene {
  constructor(app, result) {
    this.app = app;
    this.result = result || {};
    this.isRecord = this.result.distance > (this.result.oldBest || 0);
    this.doubled = false;
    this.particles = [];
    this.showTime = 0;
    if (this.isRecord) {
      for (let i = 0; i < 60; i++) Particle.burst(this.particles, app.width / 2, app.height * 0.24, 1);
      app.audio.record();
    }
    this.layout();
  }
  layout() {
    const w = this.app.width, h = this.app.height, c = GameConfig.COLORS;
    const againText = this.app.energy.canStartGame() ? '再玩一局' : '补充体力继续撞';
    this.buttons = [
      new Button({ x: w * 0.12, y: h * 0.58, w: w * 0.76, h: 58, text: againText, color: c.orange, pulse: true, onTap: () => this.again() }),
      new Button({ x: w * 0.12, y: h * 0.67, w: w * 0.36, h: 46, text: '双倍草币', color: c.green, disabled: this.doubled, onTap: () => this.doubleCoin() }),
      new Button({ x: w * 0.52, y: h * 0.67, w: w * 0.36, h: 46, text: '获取体力', color: c.pink, onTap: () => this.app.showEnergyModal() }),
      new Button({ x: w * 0.12, y: h * 0.75, w: w * 0.36, h: 46, text: '小牛变强', color: c.green, onTap: () => this.app.scene.change('Upgrade') }),
      new Button({ x: w * 0.52, y: h * 0.75, w: w * 0.36, h: 46, text: '皮肤衣柜', color: c.pink, onTap: () => this.app.scene.change('Skin') }),
      new Button({ x: w * 0.12, y: h * 0.83, w: w * 0.76, h: 44, text: '回首页', color: '#ffcf65', onTap: () => this.app.scene.change('Home') })
    ];
  }
  again() {
    if (!this.app.energy.canStartGame()) { this.app.showEnergyModal(); return; }
    this.app.energy.consumeEnergy(1);
    this.app.tasks.addProgress('energyCost', 1);
    this.app.scene.change('Game');
  }
  doubleCoin() {
    if (this.doubled) return;
    this.app.ad.showRewardedVideo((ok) => {
      if (!ok) return;
      this.doubled = true;
      PlayerData.addCoins(this.result.coins || 0);
      this.app.toast.show('双倍草币到账');
      this.layout();
    });
  }
  getComment() {
    if (this.result.bossDefeated) return '大捣蛋怪被顶飞啦！';
    if ((this.result.level || 1) >= 8) return '这头牛变大啦！';
    if ((this.result.hits || 0) >= 35) return '撞得真过瘾！';
    return '再吃一把草就起飞！';
  }
  update(dt) {
    this.showTime += dt;
    this.particles.forEach(p => p.update(dt));
    this.particles = this.particles.filter(p => !p.dead());
    this.buttons[0].text = this.app.energy.canStartGame() ? '再玩一局' : '补充体力继续撞';
  }
  getSkinText() {
    const skin = this.app.skins.getSkin(this.result.skinId) || this.app.skins.getSkin('normal');
    return skin ? skin.name : '奶团小牛';
  }
  getNextSkinHint() {
    const coins = PlayerData.getCoins();
    const target = this.app.skins.getAllSkins().find(s => !this.app.skins.isOwned(s.id) && s.price && s.price > coins);
    if (!target) return '去皮肤衣柜看看新造型！';
    return '距离 ' + target.name + ' 还差 ' + (target.price - coins) + ' 草币';
  }
  drawStatChip(ctx, label, value, x, y, w, color, delay) {
    const p = Math.max(0, Math.min(1, (this.showTime - (delay || 0)) / 260));
    const ease = 1 - Math.pow(1 - p, 3);
    ctx.save();
    ctx.translate(x + w / 2, y + 21);
    ctx.scale(0.86 + ease * 0.14, 0.86 + ease * 0.14);
    ctx.translate(-(x + w / 2), -(y + 21));
    ctx.globalAlpha = 0.2 + ease * 0.8;
    DrawUtil.drawSoftCard(ctx, x, y, w, 42, {
      color: color || '#fff8da',
      top: '#fffdf1',
      bottom: '#ffeeb8',
      radius: 18,
      blur: 6,
      offsetY: 2
    });
    ctx.textAlign = 'center';
    ctx.fillStyle = '#9b6a3b';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(label, x + w / 2, y + 15);
    ctx.fillStyle = GameConfig.COLORS.text;
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText(value, x + w / 2, y + 32);
    ctx.restore();
  }
  draw(ctx, t) {
    const w = this.app.width, h = this.app.height;
    DrawUtil.drawSoftBackground(ctx, w, h, t, 0);
    DrawUtil.drawSoftCard(ctx, w * 0.18, h * 0.135, w * 0.64, h * 0.16, { color: '#fff8da', top: '#fffdf1', bottom: '#ffeeb8', radius: 28, blur: 14 });
    for (let i = 0; i < 7; i++) {
      DrawUtil.drawSparkle(ctx, w * 0.18 + i * w * 0.11, h * 0.18 + Math.sin(t * 4 + i) * 14, 6, i % 2 ? '#ff8bb3' : '#ffd438', t + i);
    }
    CowSkinRenderer.drawCow(ctx, w / 2 - 62, h * 0.12 + Math.sin(t * 4) * 6, 0.9, this.result.skinId || this.app.skins.getCurrentSkin(), this.result.bossDefeated ? 'record' : 'idle', t);
    DrawUtil.drawTitle(ctx, this.getComment(), w / 2, h * 0.1, 30);
    DrawUtil.drawSoftCard(ctx, w * 0.08, h * 0.29, w * 0.84, h * 0.27, { color: '#fff8da', top: '#fffdf1', bottom: '#ffeeb8', radius: 26, blur: 14 });
    ctx.fillStyle = GameConfig.COLORS.text; ctx.textAlign = 'center';
    DrawUtil.drawBadge(ctx, this.result.bossDefeated ? 'Boss 已击败' : '继续挑战 Boss', w / 2 - 52, h * 0.305, this.result.bossDefeated ? GameConfig.COLORS.green : GameConfig.COLORS.pink, 104);
    DrawUtil.drawOutlinedText(ctx, '+' + (this.result.coins || 0) + ' 草币' + (this.doubled ? ' x2' : ''), w / 2, h * 0.355, 24, '#ffb02e', '#8a542f', 5);
    const chipW = w * 0.25;
    this.drawStatChip(ctx, '等级', 'Lv.' + (this.result.level || 1), w * 0.12, h * 0.385, chipW, '#fff6d5', 90);
    this.drawStatChip(ctx, '撞飞', (this.result.hits || 0) + ' 个', w * 0.375, h * 0.385, chipW, '#e9ffd6', 180);
    this.drawStatChip(ctx, '连击', 'x' + (this.result.bestCombo || 0), w * 0.63, h * 0.385, chipW, '#ffe5f0', 270);
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = GameConfig.COLORS.text;
    ctx.fillText('技能 ' + (this.result.skills || 0) + ' 个   皮肤：' + this.getSkinText(), w / 2, h * 0.475);
    ctx.fillText('剩余体力：' + this.app.energy.getEnergy(), w / 2, h * 0.507);
    ctx.fillStyle = '#ee7f22'; ctx.font = 'bold 14px sans-serif';
    ctx.fillText(this.getNextSkinHint(), w / 2, h * 0.542);
    this.buttons.forEach(b => b.draw(ctx, t));
    this.particles.forEach(p => p.draw(ctx));
  }
  touchStart(x, y) { return this.buttons.some(b => b.touchStart(x, y)); }
  touchEnd(x, y) { return this.buttons.some(b => b.touchEnd(x, y)); }
}

module.exports = ResultScene;
