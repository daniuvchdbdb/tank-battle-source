const MathUtil = require('../utils/MathUtil');
const Assets = require('../managers/AssetManager');

class Particle {
  constructor(opts) {
    Object.assign(this, {
      x: 0, y: 0, vx: 0, vy: 0, life: 600, maxLife: 600, size: 6,
      color: '#ffd83d', type: 'circle', target: null, rot: Math.random() * Math.PI * 2, vr: Math.random() * 0.16 - 0.08
    }, opts || {});
    this.maxLife = this.life;
  }
  update(dt) {
    if (this.target) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      this.vx += dx * 0.006;
      this.vy += dy * 0.006;
    }
    this.x += this.vx * dt / 16.67;
    this.y += this.vy * dt / 16.67;
    this.vy += 0.12 * dt / 16.67;
    this.rot += this.vr * dt / 16.67;
    this.life -= dt;
  }
  draw(ctx) {
    const a = MathUtil.clamp(this.life / this.maxLife, 0, 1);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.shadowColor = this.color;
    ctx.shadowBlur = this.type === 'coin' ? 6 : 8;
    const img = Assets.getImage(this.type === 'coin' ? 'effect.coin' : this.type === 'heart' ? 'effect.heart' : this.type === 'fire' ? 'effect.fire' : this.type === 'sparkle' ? 'effect.sparkle' : this.type === 'star' ? 'effect.star' : '');
    if (img) {
      const d = this.size * 2.4;
      ctx.drawImage(img, -d / 2, -d / 2, d, d);
    } else if (this.type === 'star' || this.type === 'firework') {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 ? this.size * 0.45 : this.size;
        const ang = -Math.PI / 2 + i * Math.PI / 5;
        ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
      }
      ctx.closePath();
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.globalAlpha = a * 0.45;
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 0.9, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    } else if (this.type === 'heart') {
      ctx.beginPath();
      ctx.moveTo(0, this.size * 0.65);
      ctx.bezierCurveTo(-this.size, -this.size * 0.2, -this.size * 0.55, -this.size * 1.2, 0, -this.size * 0.55);
      ctx.bezierCurveTo(this.size * 0.55, -this.size * 1.2, this.size, -this.size * 0.2, 0, this.size * 0.65);
      ctx.fillStyle = this.color || '#ff8bb3';
      ctx.fill();
    } else if (this.type === 'coin') {
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd438';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#fff5a8';
      ctx.stroke();
      ctx.fillStyle = '#a56520';
      ctx.font = 'bold ' + this.size + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('草', 0, 0);
    } else {
      ctx.globalAlpha = a * 0.34;
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 1.9, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
    ctx.restore();
  }
  dead() { return this.life <= 0; }
}

Particle.burst = function(list, x, y, count, colors) {
  colors = colors || ['#ffd438', '#ff8bb3', '#fff8b8', '#72dd73'];
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = MathUtil.rand(2, 7);
    list.push(new Particle({
      x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1,
      life: MathUtil.randInt(420, 850), size: MathUtil.rand(3, 8),
      color: colors[i % colors.length], type: i % 3 === 0 ? 'star' : 'circle'
    }));
  }
};

module.exports = Particle;
