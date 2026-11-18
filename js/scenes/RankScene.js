const Button = require('../ui/Button');
const DrawUtil = require('../utils/DrawUtil');
const GameConfig = require('../config/GameConfig');
const PlayerData = require('../managers/PlayerDataManager');

class RankScene {
  constructor(app) {
    this.app = app;
    this.back = new Button({ x: 16, y: 18, w: 72, h: 38, text: '返回', color: '#ffcf65', onTap: () => app.scene.change('Home') });
  }
  draw(ctx, t) {
    const w = this.app.width, h = this.app.height;
    DrawUtil.drawSoftBackground(ctx, w, h, t, 0);
    DrawUtil.drawTitle(ctx, '排行榜', w / 2, 70, 34);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#8b6a4b';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('看看今天谁最会乱撞', w / 2, 104);
    this.back.draw(ctx, t);
    DrawUtil.drawSoftCard(ctx, 24, 124, w - 48, 78, { color: '#fff1c2', top: '#fffdf6', bottom: '#ffe7a8', radius: 24, blur: 14 });
    DrawUtil.drawCuteIcon(ctx, 'rank', 64, 164, 42, t);
    ctx.fillStyle = GameConfig.COLORS.text; ctx.textAlign = 'left'; ctx.font = 'bold 17px sans-serif';
    ctx.fillText('我的最高乱撞分', 96, 154);
    DrawUtil.drawOutlinedText(ctx, String(PlayerData.getBestDistance()), w - 92, 164, 26, GameConfig.COLORS.orange, GameConfig.COLORS.stroke, 5);
    const list = this.app.cloud.getRankList();
    list.forEach((r, i) => {
      const y = 224 + i * 60;
      const mine = r.name === '我';
      DrawUtil.drawSoftCard(ctx, 34, y, w - 68, 46, { color: mine ? '#fff1c2' : '#fff8da', top: '#fffdf6', bottom: mine ? '#ffe7a8' : '#fff0cf', radius: 20, blur: mine ? 10 : 7, offsetY: 3 });
      DrawUtil.drawBadge(ctx, i < 3 ? ['冠军','亚军','季军'][i] : String(i + 1), 44, y + 11, i < 3 ? GameConfig.COLORS.orange : GameConfig.COLORS.green, i < 3 ? 46 : 30);
      ctx.fillStyle = GameConfig.COLORS.text; ctx.textAlign = 'left'; ctx.font = 'bold 16px sans-serif';
      ctx.fillText(r.name, i < 3 ? 100 : 82, y + 27);
      ctx.textAlign = 'right'; ctx.fillText(r.score + ' 分', w - 54, y + 25);
    });
  }
  update() {}
  touchStart(x, y) { return this.back.touchStart(x, y); }
  touchEnd(x, y) { return this.back.touchEnd(x, y); }
}

module.exports = RankScene;
