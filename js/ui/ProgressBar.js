const Button = require('./Button');

class ProgressBar {
  constructor(x, y, w, h, max) {
    this.x = x; this.y = y; this.w = w; this.h = h; this.max = max || 100; this.value = 0;
  }

  draw(ctx, color) {
    ctx.save();
    ctx.shadowColor = 'rgba(126,83,38,0.12)';
    ctx.shadowBlur = 7;
    ctx.shadowOffsetY = 3;
    Button.roundRect(ctx, this.x, this.y, this.w, this.h, this.h / 2);
    const bg = ctx.createLinearGradient ? ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.h) : null;
    if (bg) {
      bg.addColorStop(0, '#ffffff');
      bg.addColorStop(1, '#fff1bd');
      ctx.fillStyle = bg;
    } else ctx.fillStyle = '#fff8da';
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#8ac964';
    ctx.stroke();
    const p = Math.max(0, Math.min(1, this.value / this.max));
    const fw = (this.w - 8) * p;
    if (fw > 2) {
      Button.roundRect(ctx, this.x + 4, this.y + 4, fw, this.h - 8, this.h / 2);
      const fg = ctx.createLinearGradient ? ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.h) : null;
      const base = color || (p > 0.7 && p < 0.9 ? '#72dd73' : '#ffb02e');
      if (fg) {
        fg.addColorStop(0, '#fff36d');
        fg.addColorStop(0.42, base);
        fg.addColorStop(1, '#ef7f28');
        ctx.fillStyle = fg;
      } else ctx.fillStyle = base;
      ctx.fill();
      Button.roundRect(ctx, this.x + 8, this.y + 6, Math.max(4, fw - 8), Math.max(2, (this.h - 8) * 0.32), this.h / 4);
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      ctx.fill();
    }
    ctx.restore();
  }
}

module.exports = ProgressBar;
