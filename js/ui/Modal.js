const Button = require('./Button');
const CowSkinRenderer = require('../renderers/CowSkinRenderer');
const GameConfig = require('../config/GameConfig');

class Modal {
  constructor(app) {
    this.app = app;
    this.visible = false;
    this.buttons = [];
  }

  show(opts) {
    this.opts = opts || {};
    this.visible = true;
    this.showTime = 24;
    this.buttons = [];
    const w = this.app.width;
    const h = this.app.height;
    const cardW = Math.min(w - 42, 350);
    const x = (w - cardW) / 2;
    let y = h * 0.25;
    const btns = this.opts.buttons || [{ text: '知道啦', color: GameConfig.COLORS.orange, onTap: () => this.hide() }];
    const cardH = 210 + btns.length * 50;
    y = Math.max(86, (h - cardH) / 2);
    this.card = { x, y, w: cardW, h: cardH };
    btns.forEach((b, i) => {
      this.buttons.push(new Button({
        x: x + 28, y: y + 158 + i * 50, w: cardW - 56, h: 40,
        text: b.text, color: b.color || GameConfig.COLORS.orange, disabled: b.disabled, shine: true,
        onTap: () => {
          if (b.onTap) b.onTap();
          if (b.close !== false) this.hide();
        }
      }));
    });
  }

  hide() {
    this.visible = false;
  }

  touchStart(x, y) {
    if (!this.visible) return false;
    for (const b of this.buttons) if (b.touchStart(x, y)) return true;
    return true;
  }

  touchEnd(x, y) {
    if (!this.visible) return false;
    for (const b of this.buttons) if (b.touchEnd(x, y)) return true;
    return true;
  }

  update(dt) {
    if (this.visible) this.showTime = Math.min(260, (this.showTime || 0) + dt);
  }

  draw(ctx, t) {
    if (!this.visible) return;
    const c = this.card;
    const p = Math.min(1, (this.showTime || 0) / 220);
    const eased = 1 - Math.pow(1 - p, 3);
    const scale = 0.9 + eased * 0.1;
    ctx.save();
    ctx.globalAlpha = eased;
    ctx.fillStyle = 'rgba(92, 74, 61, 0.34)';
    ctx.fillRect(0, 0, this.app.width, this.app.height);
    ctx.fillStyle = 'rgba(255,248,218,0.18)';
    ctx.beginPath();
    ctx.arc(this.app.width * 0.5, this.app.height * 0.32, this.app.width * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.translate(c.x + c.w / 2, c.y + c.h / 2);
    ctx.scale(scale, scale);
    ctx.translate(-(c.x + c.w / 2), -(c.y + c.h / 2));
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i % 2 ? 'rgba(255,157,183,0.28)' : 'rgba(255,217,120,0.32)';
      ctx.beginPath();
      ctx.arc(c.x + 28 + i * (c.w - 56) / 5, c.y + 28 + Math.sin(t * 2 + i) * 5, 4 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowColor = 'rgba(122,82,30,0.28)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 8;
    const modalImg = this.app.assets.getImage('ui.modal');
    if (modalImg) ctx.drawImage(modalImg, c.x, c.y, c.w, c.h);
    else {
      Button.roundRect(ctx, c.x, c.y, c.w, c.h, 26);
      const g = ctx.createLinearGradient(c.x, c.y, c.x, c.y + c.h);
      g.addColorStop(0, GameConfig.COLORS.cream3);
      g.addColorStop(0.62, GameConfig.COLORS.cream2);
      g.addColorStop(1, '#ffe7a8');
      ctx.fillStyle = g;
      ctx.fill();
    }
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255,255,255,0.92)';
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(92,74,61,0.08)';
    ctx.stroke();
    Button.roundRect(ctx, c.x + 22, c.y + 16, c.w - 44, 48, 24);
    ctx.fillStyle = 'rgba(255,216,104,0.32)';
    ctx.fill();
    CowSkinRenderer.drawCow(ctx, c.x + c.w / 2 - 56, c.y + 50 + Math.sin(t * 5) * 3, 0.72, this.opts.skinId || 'normal', this.opts.cowState || 'sad', t);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = GameConfig.COLORS.text;
    ctx.font = 'bold 22px sans-serif';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.strokeText(this.opts.title || '提示', c.x + c.w / 2, c.y + 40);
    ctx.fillText(this.opts.title || '提示', c.x + c.w / 2, c.y + 40);
    ctx.font = '16px sans-serif';
    const lines = String(this.opts.message || '').split('\n');
    lines.forEach((line, i) => ctx.fillText(line, c.x + c.w / 2, c.y + 124 + i * 22));
    for (const b of this.buttons) b.draw(ctx, t);
    ctx.restore();
  }
}

module.exports = Modal;
