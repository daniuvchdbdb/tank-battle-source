const Button = require('../ui/Button');
const DrawUtil = require('../utils/DrawUtil');
const GameConfig = require('../config/GameConfig');
const PlayerData = require('../managers/PlayerDataManager');

class ShopScene {
  constructor(app) {
    this.app = app; this.scroll = 0; this.dragY = 0; this.dragging = false;
    this.back = new Button({ x: 16, y: 18, w: 72, h: 38, text: '返回', color: '#ffcf65', onTap: () => app.scene.change('Home') });
  }
  draw(ctx, t) {
    const w = this.app.width, h = this.app.height;
    DrawUtil.drawSoftBackground(ctx, w, h, t, 0);
    DrawUtil.drawTitle(ctx, '小牛补给', w / 2, 70, 34);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#8b6a4b';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('给奶牛准备一点软萌补给', w / 2, 104);
    DrawUtil.drawTopPill(ctx, w - 138, 20, '草币 ' + PlayerData.getCoins(), '#fff8da');
    DrawUtil.drawTopPill(ctx, w - 138, 62, '体力 ' + this.app.energy.getEnergy(), '#fff8da');
    this.back.draw(ctx, t);
    this.buttons = [this.back];
    this.app.shop.getProducts().forEach((p, i) => {
      const y = 126 + i * 112 - this.scroll;
      if (y > h || y + 96 < 96) return;
      const hot = i === 2 || i === 5;
      ctx.save();
      DrawUtil.drawSoftCard(ctx, 22, y, w - 44, 102, {
        color: hot ? '#fff1c2' : '#fff8da',
        top: '#fffdf6',
        bottom: hot ? '#ffe7a8' : '#fff0cf',
        radius: 24,
        blur: hot ? 17 : 11,
        offsetY: hot ? 6 : 4
      });
      if (hot) {
        for (let k = 0; k < 4; k++) DrawUtil.drawSparkle(ctx, 36 + k * 22, y + 30 + Math.sin(t * 5 + k) * 4, 5, '#ffd64a', t + k);
      }
      DrawUtil.drawCuteIcon(ctx, i < 2 ? 'energy' : i === 5 ? 'skin' : 'shop', 64, y + 62, 46, t);
      DrawUtil.drawBadge(ctx, p.tag, 34, y + 12, hot ? GameConfig.COLORS.pink : GameConfig.COLORS.green, 78);
      ctx.fillStyle = GameConfig.COLORS.text; ctx.textAlign = 'left'; ctx.font = 'bold 18px sans-serif'; ctx.fillText(p.name, 96, y + 48);
      ctx.fillStyle = '#8b6a4b';
      ctx.font = '13px sans-serif'; ctx.fillText(p.desc, 96, y + 72);
      DrawUtil.drawBadge(ctx, '模拟发放', 96, y + 80, 'rgba(92,74,61,0.35)', 70);
      const btn = new Button({ x: w - 118, y: y + 31, w: 84, h: 42, text: p.price + ' 元', color: GameConfig.COLORS.orange, onTap: () => this.app.shop.purchaseProduct(p.productId) });
      btn.draw(ctx, t); this.buttons.push(btn);
      ctx.restore();
    });
  }
  update() {}
  touchStart(x, y) { this.dragging = true; this.dragY = y; return this.buttons.some(b => b.touchStart(x, y)); }
  touchMove(x, y) { if (this.dragging) { this.scroll = Math.max(0, this.scroll + this.dragY - y); this.dragY = y; } }
  touchEnd(x, y) { this.dragging = false; return this.buttons.some(b => b.touchEnd(x, y)); }
}

module.exports = ShopScene;
