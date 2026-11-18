const Button = require('../ui/Button');
const ProgressBar = require('../ui/ProgressBar');
const DrawUtil = require('../utils/DrawUtil');
const GameConfig = require('../config/GameConfig');

class TaskScene {
  constructor(app) {
    this.app = app;
    this.back = new Button({ x: 16, y: 18, w: 72, h: 38, text: '返回', color: '#ffcf65', onTap: () => app.scene.change('Home') });
  }
  draw(ctx, t) {
    const w = this.app.width, h = this.app.height;
    DrawUtil.drawSoftBackground(ctx, w, h, t, 0);
    DrawUtil.drawTitle(ctx, '今日小任务', w / 2, 70, 34);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#8b6a4b';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('做点小事，给奶牛攒零食', w / 2, 104);
    this.back.draw(ctx, t);
    this.buttons = [this.back];
    const tasks = this.app.tasks.getTasks();
    tasks.forEach((task, i) => {
      const y = 130 + i * 126;
      const done = task.progress >= task.target;
      DrawUtil.drawSoftCard(ctx, 22, y, w - 44, 106, {
        color: done ? '#fff1c2' : '#fff8da',
        top: '#fffdf6',
        bottom: done ? '#ffe7a8' : '#fff0cf',
        radius: 24,
        blur: done ? 14 : 10
      });
      DrawUtil.drawBadge(ctx, done ? '可领取' : '进行中', 34, y + 12, done ? GameConfig.COLORS.orange : GameConfig.COLORS.green, 64);
      DrawUtil.drawCuteIcon(ctx, task.reward.tickets ? 'energy' : 'coin', 56, y + 62, 42, t);
      ctx.fillStyle = GameConfig.COLORS.text; ctx.textAlign = 'left'; ctx.font = 'bold 18px sans-serif'; ctx.fillText(task.title, 86, y + 30);
      const txt = task.reward.coins ? task.reward.coins + ' 草币' : task.reward.tickets + ' 张体力券';
      ctx.fillStyle = '#8b6a4b';
      ctx.font = '14px sans-serif'; ctx.fillText('奖励：' + txt, 86, y + 54);
      const bar = new ProgressBar(86, y + 70, w * 0.36, 14, task.target); bar.value = task.progress || 0; bar.draw(ctx, done ? GameConfig.COLORS.orange : GameConfig.COLORS.green);
      ctx.fillStyle = '#8a542f'; ctx.textAlign = 'center'; ctx.font = 'bold 13px sans-serif'; ctx.fillText((task.progress || 0) + '/' + task.target, w * 0.455, y + 82);
      const btn = new Button({ x: w - 126, y: y + 36, w: 90, h: 40, text: task.claimed ? '已领取' : done ? '领取' : '未完成', color: done ? '#ffb02e' : '#b8d998', disabled: task.claimed || !done, onTap: () => this.app.tasks.claim(task.id) });
      btn.draw(ctx, t); this.buttons.push(btn);
    });
  }
  update() {}
  touchStart(x, y) { return this.buttons.some(b => b.touchStart(x, y)); }
  touchEnd(x, y) { return this.buttons.some(b => b.touchEnd(x, y)); }
}

module.exports = TaskScene;
