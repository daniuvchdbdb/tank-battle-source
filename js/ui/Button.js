const GameConfig = require('../config/GameConfig');
const Assets = require('../managers/AssetManager');

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

class Button {
  constructor(opts) {
    Object.assign(this, {
      x: 0, y: 0, w: 120, h: 48, text: '', icon: '', color: GameConfig.COLORS.orange,
      textColor: '#fffdf4', disabled: false, pulse: false, scale: 1, onTap: null, subText: '',
      imageKey: '', iconKey: '', variant: '', shine: true, bounce: true
    }, opts || {});
    this.down = false;
  }

  contains(x, y) {
    return x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h;
  }

  touchStart(x, y) {
    if (!this.disabled && this.contains(x, y)) this.down = true;
    return this.down;
  }

  touchEnd(x, y) {
    const ok = this.down && !this.disabled && this.contains(x, y);
    this.down = false;
    if (ok && this.onTap) this.onTap();
    return ok;
  }

  draw(ctx, t) {
    const pulseScale = this.pulse ? 1 + Math.sin(t * 4) * 0.025 : 1;
    const downScale = this.down ? 0.94 : 1;
    const s = this.scale * pulseScale * downScale;
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    ctx.translate(-cx, -cy);
    ctx.globalAlpha = this.disabled ? 0.55 : 1;
    ctx.shadowColor = 'rgba(139, 82, 28, 0.24)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = this.down ? 3 : 7;
    const img = this.imageKey ? Assets.getImage(this.imageKey) : null;
    const bottomColor = this.disabled ? '#9fb992' : shadeColor(this.color, -18);
    if (img) {
      ctx.drawImage(img, this.x, this.y, this.w, this.h);
      roundRect(ctx, this.x + 3, this.y + this.h - 12, this.w - 6, 9, 8);
      ctx.fillStyle = 'rgba(126,83,38,0.16)';
      ctx.fill();
    } else {
      roundRect(ctx, this.x, this.y + 5, this.w, this.h, Math.min(24, this.h / 2));
      ctx.fillStyle = bottomColor;
      ctx.fill();
      roundRect(ctx, this.x, this.y, this.w, this.h, Math.min(24, this.h / 2));
      const g = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.h);
      g.addColorStop(0, shadeColor(this.color, 34));
      g.addColorStop(0.18, this.disabled ? '#c4d8b8' : this.color);
      g.addColorStop(1, this.disabled ? '#a7bd9e' : shadeColor(this.color, -7));
      ctx.fillStyle = g;
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = 'rgba(255,255,255,0.82)';
      ctx.stroke();
      if (this.shine) {
        roundRect(ctx, this.x + 10, this.y + 7, this.w - 20, Math.max(9, this.h * 0.2), 12);
        ctx.fillStyle = 'rgba(255,255,255,0.28)';
        ctx.fill();
      }
    }
    ctx.shadowColor = 'transparent';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold ' + Math.floor(this.h * 0.36) + 'px sans-serif';
    const icon = Assets.getImage(this.iconKey);
    let textX = cx;
    if (icon) {
      const iw = Math.min(this.h * 0.62, 34);
      ctx.drawImage(icon, cx - this.w * 0.31, cy - iw / 2, iw, iw);
      textX = cx + iw * 0.25;
    }
    const label = (!icon && this.icon) ? this.icon + ' ' + this.text : this.text;
    ctx.lineWidth = Math.max(2, this.h * 0.055);
    ctx.strokeStyle = 'rgba(122,75,42,0.36)';
    ctx.strokeText(label, textX, this.subText ? cy - 7 : cy);
    ctx.fillStyle = this.textColor;
    ctx.fillText(label, textX, this.subText ? cy - 7 : cy);
    if (this.subText) {
      ctx.font = Math.floor(this.h * 0.22) + 'px sans-serif';
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(122,75,42,0.22)';
      ctx.strokeText(this.subText, cx, cy + 15);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillText(this.subText, cx, cy + 15);
    }
    ctx.restore();
  }
}

function shadeColor(hex, percent) {
  const n = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
  const b = Math.max(0, Math.min(255, (n & 255) + amt));
  return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
}

Button.roundRect = roundRect;
module.exports = Button;
