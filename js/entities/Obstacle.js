const GameConfig = require('../config/GameConfig');
const MathUtil = require('../utils/MathUtil');

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

class Obstacle {
  constructor(type, worldX, groundY) {
    this.type = type;
    this.worldX = worldX;
    this.y = groundY;
    this.w = type === 'stone' ? 54 : 58;
    this.h = type === 'chest' ? 54 : 48;
    this.hit = false;
    this.fly = 0;
    this.rot = 0;
    this.vx = 0;
    this.vy = 0;
  }
  get screenX() { return this._screenX || 0; }
  update(dt, scrollX) {
    this._screenX = this.worldX - scrollX;
    if (this.hit) {
      this.fly += dt / 16.67;
      this.rot += 0.18 * dt / 16.67;
      this.worldX += this.vx * dt / 16.67;
      this.y += this.vy * dt / 16.67;
      this.vy += 0.5 * dt / 16.67;
    }
  }
  bounds(scrollX) {
    return { x: this.worldX - scrollX, y: this.y - this.h, w: this.w, h: this.h };
  }
  knock(power) {
    this.hit = true;
    this.vx = MathUtil.rand(5, 10) + power * 0.02;
    this.vy = MathUtil.rand(-11, -6);
  }
  draw(ctx, scrollX) {
    const x = this.worldX - scrollX;
    const y = this.y;
    ctx.save();
    ctx.translate(x + this.w / 2, y - this.h / 2);
    ctx.rotate(this.rot);
    ctx.translate(-this.w / 2, -this.h / 2);
    const type = this.type;
    if (type === 'hay' || type === 'goldenHay') {
      ctx.fillStyle = type === 'goldenHay' ? '#ffd438' : '#e6b94e';
      roundRect(ctx, 0, 8, this.w, this.h - 8, 12);
      ctx.fill();
      ctx.strokeStyle = '#9b6c25'; ctx.lineWidth = 3; ctx.stroke();
      for (let i = 0; i < 4; i++) { ctx.strokeStyle = '#fff0a2'; ctx.beginPath(); ctx.moveTo(8 + i * 12, 12); ctx.lineTo(2 + i * 14, this.h - 4); ctx.stroke(); }
    } else if (type === 'box') {
      ctx.fillStyle = '#c9843a'; ctx.fillRect(2, 5, this.w - 4, this.h - 5);
      ctx.strokeStyle = '#8a542f'; ctx.lineWidth = 4; ctx.strokeRect(2, 5, this.w - 4, this.h - 5);
      ctx.beginPath(); ctx.moveTo(4, 7); ctx.lineTo(this.w - 4, this.h - 2); ctx.moveTo(this.w - 4, 7); ctx.lineTo(4, this.h - 2); ctx.stroke();
    } else if (type === 'stone') {
      ctx.fillStyle = '#b9b0a1'; ctx.beginPath(); ctx.arc(26, 25, 26, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#8c8172'; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.fillRect(16, 14, 8, 8); ctx.fillRect(33, 14, 8, 8);
      ctx.fillStyle = '#5d5148'; ctx.fillRect(19, 17, 3, 3); ctx.fillRect(36, 17, 3, 3);
    } else if (type === 'spring') {
      ctx.fillStyle = '#ff8bb3'; ctx.fillRect(7, 28, 44, 10);
      ctx.strokeStyle = '#5daae8'; ctx.lineWidth = 4;
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(17 + i * 8, 25, 9, 0, Math.PI); ctx.stroke(); }
    } else if (type === 'poop') {
      ctx.fillStyle = '#c9894b';
      ctx.beginPath(); ctx.arc(28, 34, 23, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(31, 19, 17, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(34, 8, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(20, 29, 5, 0, Math.PI * 2); ctx.arc(37, 29, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#5b2d19'; ctx.fillRect(19, 28, 3, 3); ctx.fillRect(36, 28, 3, 3);
    } else if (type === 'chest') {
      ctx.fillStyle = '#ffb02e'; ctx.fillRect(2, 17, 54, 34);
      ctx.fillStyle = '#8a542f'; ctx.fillRect(2, 17, 54, 8);
      ctx.fillStyle = '#fff5a8'; ctx.fillRect(25, 24, 10, 12);
    }
    ctx.restore();
  }
  rewardCoins() { return (GameConfig.OBSTACLES[this.type] || {}).coin || 0; }
}

module.exports = Obstacle;
