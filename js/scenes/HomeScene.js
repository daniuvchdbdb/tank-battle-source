const Button = require('../ui/Button');
const CowSkinRenderer = require('../renderers/CowSkinRenderer');
const DrawUtil = require('../utils/DrawUtil');
const GameConfig = require('../config/GameConfig');
const PlayerData = require('../managers/PlayerDataManager');

class HomeScene {
  constructor(app) {
    this.app = app;
    this.buttons = [];
    this.cowPop = 0;
    this.layout();
  }
  layout() {
    const w = this.app.width, h = this.app.height;
    const c = GameConfig.COLORS;
    this.startBtn = new Button({
      x: w * 0.12, y: h * 0.58, w: w * 0.76, h: 72, text: '冲一下',
      subText: this.app.energy.canStartGame() ? '消耗 1 体力' : '体力不足，点击获取',
      color: c.orange, pulse: true, variant: 'orange', shine: true, onTap: () => this.startGame()
    });
    const by = h * 0.72, bw = (w - 58) / 3;
    const items = [
      ['升级', '', 'Upgrade', 'ui.icon.upgrade'], ['皮肤', '', 'Skin', 'ui.icon.skin'], ['商店', '', 'Shop', 'ui.icon.shop'],
      ['任务', '', 'Task', 'ui.icon.task'], ['排行', '', 'Rank', 'ui.icon.rank']
    ];
    this.buttons = [this.startBtn];
    items.forEach((it, i) => {
      const row = i < 3 ? 0 : 1;
      const col = i < 3 ? i : i - 3;
      const x = 20 + col * (bw + 9) + (row ? bw / 2 : 0);
      this.buttons.push(new Button({ x, y: by + row * 58, w: bw, h: 48, text: it[0], icon: it[1], iconKey: it[3], variant: row ? 'pink' : 'green', color: row ? c.pink : c.green, onTap: () => this.app.scene.change(it[2]) }));
    });
  }
  startGame() {
    if (!this.app.energy.canStartGame()) { this.app.showEnergyModal(); return; }
    this.app.energy.consumeEnergy(1);
    this.app.tasks.addProgress('energyCost', 1);
    this.app.scene.change('Game');
  }
  update(dt) {
    this.startBtn.subText = this.app.energy.canStartGame() ? '消耗 1 体力' : '体力不足，点击获取';
    if (this.cowPop > 0) this.cowPop -= dt;
  }
  draw(ctx, t) {
    const w = this.app.width, h = this.app.height;
    DrawUtil.drawSoftBackground(ctx, w, h, t, 0);
    DrawUtil.drawTopPill(ctx, 14, 18, '⚡ ' + this.app.energy.getEnergy() + '/' + this.app.energy.getMaxEnergy(), '#fff8da');
    DrawUtil.drawTopPill(ctx, w - 132, 18, '草币 ' + PlayerData.getCoins(), '#fff8da');
    DrawUtil.drawCuteIcon(ctx, 'energy', 30, 36, 28, t);
    DrawUtil.drawCuteIcon(ctx, 'coin', w - 115, 36, 28, t);
    if (this.app.energy.getEnergy() < this.app.energy.getMaxEnergy()) {
      ctx.fillStyle = '#7a542e'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(this.app.energy.getNextRecoverTimeText(), w / 2, 43);
    }
    DrawUtil.drawTitle(ctx, '奶牛大乱撞', w / 2, h * 0.145, Math.min(42, w * 0.112));
    ctx.fillStyle = GameConfig.COLORS.text; ctx.font = 'bold 19px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('吃草变大，顶飞捣蛋怪！', w / 2, h * 0.205);
    DrawUtil.drawSoftCard(ctx, w * 0.12, h * 0.245, w * 0.76, h * 0.28, {
      color: '#fff8da',
      top: '#fffdf1',
      bottom: '#ffeeb8',
      radius: 30,
      blur: 18
    });
    DrawUtil.drawBadge(ctx, '今日奶牛', w * 0.5 - 42, h * 0.255, GameConfig.COLORS.pink, 84);
    for (let i = 0; i < 5; i++) {
      DrawUtil.drawSparkle(ctx, w * 0.22 + i * w * 0.14, h * 0.305 + Math.sin(t * 2 + i) * 8, 6, 'rgba(255,216,86,0.75)', t + i);
    }
    const pop = this.cowPop > 0 ? 1 + Math.sin((1 - this.cowPop / 360) * Math.PI) * 0.1 : 1;
    CowSkinRenderer.drawCow(ctx, w / 2 - 82 * pop, h * 0.35 + Math.sin(t * 3) * 7 - (pop - 1) * 30, 1.08 * pop, this.app.skins.getCurrentSkin(), this.cowPop > 0 ? 'record' : 'idle', t);
    for (const b of this.buttons) b.draw(ctx, t);
    ctx.fillStyle = '#8a542f'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(GameConfig.VERSION, w / 2, h - 18);
  }
  touchStart(x, y) {
    if (y < 58 && x < 150) { this.app.showEnergyModal(); return true; }
    const w = this.app.width, h = this.app.height;
    if (x > w * 0.18 && x < w * 0.82 && y > h * 0.28 && y < h * 0.53) {
      this.cowPop = 360;
      return true;
    }
    return this.buttons.some(b => b.touchStart(x, y));
  }
  touchEnd(x, y) { return this.buttons.some(b => b.touchEnd(x, y)); }
}

module.exports = HomeScene;
