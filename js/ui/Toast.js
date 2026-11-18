function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

class Toast {
  constructor() {
    this.items = [];
  }

  show(text, duration) {
    this.items.push({ text, life: duration || 1500, max: duration || 1500 });
  }

  update(dt) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      this.items[i].life -= dt;
      if (this.items[i].life <= 0) this.items.splice(i, 1);
    }
  }

  draw(ctx, w, h) {
    if (!this.items.length) return;
    const item = this.items[this.items.length - 1];
    const a = Math.min(1, item.life / 250, (item.max - item.life) / 180);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 18px sans-serif';
    const tw = ctx.measureText(item.text).width + 42;
    const x = (w - tw) / 2;
    const y = h * 0.18;
    ctx.shadowColor = 'rgba(126,83,38,0.2)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 6;
    roundRect(ctx, x, y, tw, 42, 21);
    const g = ctx.createLinearGradient ? ctx.createLinearGradient(x, y, x, y + 42) : null;
    if (g) {
      g.addColorStop(0, '#fffdf1');
      g.addColorStop(1, '#ffcf65');
      ctx.fillStyle = g;
    } else ctx.fillStyle = '#ffcf65';
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255,255,255,0.86)';
    ctx.stroke();
    roundRect(ctx, x + 10, y + 6, tw - 20, 10, 5);
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#8a542f';
    ctx.strokeText(item.text, w / 2, y + 21);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.strokeText(item.text, w / 2, y + 21);
    ctx.fillStyle = '#7a542e';
    ctx.fillText(item.text, w / 2, y + 21);
    ctx.restore();
  }
}

module.exports = Toast;
