const Button = require('../ui/Button');
const ProgressBar = require('../ui/ProgressBar');
const DrawUtil = require('../utils/DrawUtil');
const GameConfig = require('../config/GameConfig');
const PlayerData = require('../managers/PlayerDataManager');

class UpgradeScene {
  constructor(app) { this.app = app; this.buttons = []; this.back = new Button({ x: 16, y: 18, w: 72, h: 38, text: '返回', color: '#ffcf65', onTap: () => app.scene.change('Home') }); }
  drawUpgradeCard(ctx, u, i, y, t) {
    const w = this.app.width;
    const level = PlayerData.getUpgradeLevel(u.key);
    const cost = PlayerData.getUpgradeCost(u.key);
    const colors = ['#fff4cd', '#eaffd8', '#ffe7ef', '#eaf8ff', '#f0eaff'];
    DrawUtil.drawSoftCard(ctx, 18, y, w - 36, 84, {
      color: colors[i % colors.length],
      top: '#fffdf6',
      bottom: colors[i % colors.length],
      radius: 24,
      blur: 11,
      offsetY: 4
    });
    DrawUtil.drawBadge(ctx, 'Lv.' + level, 28, y + 10, i === 4 ? GameConfig.COLORS.orange : GameConfig.COLORS.green, 48);
    DrawUtil.drawCuteIcon(ctx, i === 0 ? 'upgrade' : i === 4 ? 'coin' : 'energy', 52, y + 50, 40, t);
    ctx.textAlign = 'left';
    ctx.fillStyle = GameConfig.COLORS.text;
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(u.name, 82, y + 28);
    ctx.fillStyle = '#8b6a4b';
    ctx.font = '13px sans-serif';
    ctx.fillText(u.desc, 82, y + 50);
    const bar = new ProgressBar(82, y + 60, w * 0.34, 12, 20);
    bar.value = level;
    bar.draw(ctx, i === 4 ? GameConfig.COLORS.orange : GameConfig.COLORS.green);
    DrawUtil.drawBadge(ctx, '草币 ' + cost, w - 116, y + 14, GameConfig.COLORS.orange, 86);
    const btn = new Button({ x: w - 118, y: y + 42, w: 88, h: 34, text: '升级', color: GameConfig.COLORS.orange, onTap: () => {
      if (PlayerData.upgrade(u.key)) this.app.toast.show('升级成功');
      else this.app.toast.show('草币不足');
    }});
    btn.draw(ctx, t);
    this.buttons.push(btn);
  }
  draw(ctx, t) {
    const w = this.app.width, h = this.app.height;
    DrawUtil.drawSoftBackground(ctx, w, h, t, 0);
    DrawUtil.drawTitle(ctx, '小牛变强', w / 2, 72, 34);
    DrawUtil.drawTopPill(ctx, w - 138, 20, '草币 ' + PlayerData.getCoins(), '#fff8da');
    this.back.draw(ctx, t);
    this.buttons = [this.back];
    GameConfig.UPGRADES.forEach((u, i) => {
      this.drawUpgradeCard(ctx, u, i, 120 + i * 92, t);
    });
  }
  update() {}
  touchStart(x, y) { return this.buttons.some(b => b.touchStart(x, y)); }
  touchEnd(x, y) { return this.buttons.some(b => b.touchEnd(x, y)); }
}

module.exports = UpgradeScene;
