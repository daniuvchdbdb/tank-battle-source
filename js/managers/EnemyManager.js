const MathUtil = require('../utils/MathUtil');

const ENEMY_TYPES = {
  grass: { name: '小草团', size: 24, xp: 10, coin: 4, color: '#83d95d', move: 'idle' },
  mushroom: { name: '蘑菇团子', size: 32, xp: 16, coin: 7, color: '#ff9aa8', move: 'wander' },
  corn: { name: '玉米胖胖', size: 38, xp: 20, coin: 13, color: '#ffd84a', move: 'wander' },
  stone: { name: '石头圆滚滚', size: 54, xp: 28, coin: 12, color: '#b9b0a1', move: 'idle' },
  mud: { name: '泥巴团子', size: 42, xp: 20, coin: 10, color: '#ad7442', move: 'wander' },
  bee: { name: '蜜蜂球', size: 34, xp: 22, coin: 12, color: '#ffe052', move: 'circle' },
  hay: { name: '草垛怪', size: 44, xp: 26, coin: 16, color: '#e6b94e', move: 'idle' },
  sheep: { name: '捣蛋羊', size: 36, xp: 24, coin: 14, color: '#fff8ef', move: 'chase' }
};

const BOSS_TYPES = [
  { id: 'boss_hay', name: '草垛大王', size: 92, hp: 8, color: '#e6b94e' },
  { id: 'boss_corn', name: '玉米大王', size: 88, hp: 8, color: '#ffd84a' },
  { id: 'boss_mushroom', name: '蘑菇大王', size: 86, hp: 7, color: '#ff9aa8' },
  { id: 'boss_stone', name: '石头胖胖', size: 102, hp: 9, color: '#b9b0a1' },
  { id: 'boss_mud', name: '泥巴大团子', size: 96, hp: 8, color: '#ad7442' }
];

function dist(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function line(ctx, x1, y1, x2, y2, color, w) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = w || 2;
  ctx.lineCap = 'round';
  ctx.stroke();
}

class EnemyManager {
  constructor(scene) {
    this.scene = scene;
    this.enemies = [];
    this.boss = null;
    this.spawnTimer = 0;
    this.bossMessage = 0;
    for (let i = 0; i < 24; i++) this.spawnEnemy(true);
  }

  randomPoint(nearCow) {
    const c = this.scene.cow;
    if (nearCow) {
      const a = Math.random() * Math.PI * 2;
      const d = MathUtil.rand(240, 720);
      return this.scene.clampWorld(c.x + Math.cos(a) * d, c.y + Math.sin(a) * d);
    }
    return this.scene.clampWorld(MathUtil.rand(80, this.scene.worldW - 80), MathUtil.rand(80, this.scene.worldH - 80));
  }

  spawnEnemy(nearCow) {
    const ids = Object.keys(ENEMY_TYPES);
    const id = MathUtil.choose(ids);
    const cfg = ENEMY_TYPES[id];
    const p = this.randomPoint(nearCow);
    this.enemies.push({
      id: id + '_' + Date.now() + '_' + Math.random(),
      type: id,
      x: p.x,
      y: p.y,
      vx: MathUtil.rand(-0.6, 0.6),
      vy: MathUtil.rand(-0.6, 0.6),
      phase: Math.random() * 10,
      size: cfg.size + MathUtil.rand(-4, 5),
      cfg,
      knocked: false,
      rot: 0,
      life: 1
    });
  }

  spawnBoss() {
    if (this.boss) return;
    const cfg = MathUtil.choose(BOSS_TYPES);
    const p = this.randomPoint(true);
    this.boss = { x: p.x, y: p.y, vx: 0, vy: 0, cfg, size: cfg.size, hp: cfg.hp, maxHp: cfg.hp, rot: 0, defeated: false };
    this.scene.toastText = cfg.name + ' 出现啦！';
    this.scene.toastTimer = 1600;
  }

  update(dt) {
    const step = dt / 16.67;
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.enemies.length < 42) {
      this.spawnEnemy(true);
      this.spawnTimer = 520;
    }
    const cow = this.scene.cow;
    this.enemies.forEach(e => {
      e.phase += dt / 1000;
      if (e.knocked) {
        e.x += e.vx * step;
        e.y += e.vy * step;
        e.vx *= 0.985;
        e.vy *= 0.985;
        e.rot += 0.22 * step;
        e.life -= dt / 800;
        return;
      }
      if (e.cfg.move === 'wander') {
        e.x += Math.cos(e.phase * 1.7) * 0.65 * step + e.vx * step;
        e.y += Math.sin(e.phase * 1.4) * 0.65 * step + e.vy * step;
      } else if (e.cfg.move === 'circle') {
        e.x += Math.cos(e.phase * 3) * 1.2 * step;
        e.y += Math.sin(e.phase * 3) * 1.2 * step;
      } else if (e.cfg.move === 'chase') {
        const d = Math.max(1, dist(e, cow));
        e.x += (cow.x - e.x) / d * 0.72 * step;
        e.y += (cow.y - e.y) / d * 0.72 * step;
      }
      const p = this.scene.clampWorld(e.x, e.y);
      e.x = p.x;
      e.y = p.y;
    });
    this.enemies = this.enemies.filter(e => e.life > 0);
    if (this.boss && !this.boss.defeated) {
      const d = Math.max(1, dist(this.boss, cow));
      this.boss.x += (cow.x - this.boss.x) / d * 0.28 * step;
      this.boss.y += (cow.y - this.boss.y) / d * 0.28 * step;
      this.boss.rot += 0.01 * step;
    }
  }

  knockEnemy(e, from, power) {
    const d = Math.max(1, dist(e, from));
    e.knocked = true;
    e.vx = (e.x - from.x) / d * (9 + power * 0.03);
    e.vy = (e.y - from.y) / d * (9 + power * 0.03);
    e.life = 1;
  }

  drawEnemy(ctx, e, sx, sy, t) {
    const s = e.size;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(e.rot);
    ctx.shadowColor = 'rgba(122,82,30,0.18)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 5;
    const g = ctx.createRadialGradient ? ctx.createRadialGradient(-s * 0.22, -s * 0.28, s * 0.08, 0, 0, s * 0.74) : null;
    if (g) {
      g.addColorStop(0, '#fff8da');
      g.addColorStop(0.18, e.cfg.color);
      g.addColorStop(1, e.cfg.color);
      ctx.fillStyle = g;
    } else ctx.fillStyle = e.cfg.color;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#8a542f';
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.beginPath();
    ctx.arc(-s * 0.18, -s * 0.24, s * 0.18, 0, Math.PI * 2);
    ctx.fill();
    if (e.type === 'bee') {
      ctx.fillStyle = '#6b3b1f';
      ctx.fillRect(-s * 0.35, -s * 0.15, s * 0.7, s * 0.12);
      ctx.fillRect(-s * 0.35, s * 0.12, s * 0.7, s * 0.12);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath();
      ctx.ellipse(-s * 0.35, -s * 0.55, s * 0.22, s * 0.12, -0.4, 0, Math.PI * 2);
      ctx.ellipse(s * 0.35, -s * 0.55, s * 0.22, s * 0.12, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    if (e.type === 'corn') {
      ctx.fillStyle = '#fff6a8';
      for (let i = -2; i <= 2; i++) ctx.fillRect(i * 7 - 2, -s * 0.4, 4, s * 0.8);
    }
    if (e.type === 'hay') {
      ctx.strokeStyle = '#fff0a2';
      for (let i = -2; i <= 2; i++) line(ctx, i * 8, -s * 0.45, i * 2, s * 0.45, '#fff0a2', 2);
    }
    if (e.type === 'sheep') {
      ctx.fillStyle = '#5a3324';
      ctx.beginPath();
      ctx.arc(-s * 0.48, -s * 0.05, s * 0.14, 0, Math.PI * 2);
      ctx.arc(s * 0.48, -s * 0.05, s * 0.14, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#3c2418';
    ctx.beginPath();
    ctx.arc(-s * 0.18, -s * 0.08, 3.2, 0, Math.PI * 2);
    ctx.arc(s * 0.18, -s * 0.08, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7d3f22';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, s * 0.14, s * 0.14, 0, Math.PI);
    ctx.stroke();
    ctx.restore();
  }

  drawBoss(ctx, boss, sx, sy) {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(boss.rot);
    ctx.shadowColor = 'rgba(122,82,30,0.24)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 7;
    const g = ctx.createRadialGradient ? ctx.createRadialGradient(-boss.size * 0.2, -boss.size * 0.28, boss.size * 0.1, 0, 0, boss.size * 0.76) : null;
    if (g) {
      g.addColorStop(0, '#fff8da');
      g.addColorStop(0.16, boss.cfg.color);
      g.addColorStop(1, boss.cfg.color);
      ctx.fillStyle = g;
    } else ctx.fillStyle = boss.cfg.color;
    ctx.beginPath();
    ctx.arc(0, 0, boss.size * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#8a542f';
    ctx.stroke();
    ctx.fillStyle = '#fff8da';
    ctx.beginPath();
    ctx.arc(-18, -8, 8, 0, Math.PI * 2);
    ctx.arc(18, -8, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3c2418';
    ctx.beginPath();
    ctx.arc(-18, -8, 3, 0, Math.PI * 2);
    ctx.arc(18, -8, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    const w = 92;
    const bx = sx - w / 2;
    const by = sy - boss.size * 0.78;
    ctx.save();
    ctx.shadowColor = 'rgba(126,83,38,0.16)';
    ctx.shadowBlur = 7;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = '#fff8da';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, w, 10, 5);
    else ctx.rect(bx, by, w, 10);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#ff7b7b';
    const hpw = w * Math.max(0, boss.hp / boss.maxHp);
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx + 2, by + 2, Math.max(0, hpw - 4), 6, 3);
    else ctx.rect(bx + 2, by + 2, Math.max(0, hpw - 4), 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, w, 10, 5);
    else ctx.rect(bx, by, w, 10);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = '#8a542f';
    ctx.textAlign = 'center';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(boss.cfg.name, sx, by - 6);
  }
}

EnemyManager.ENEMY_TYPES = ENEMY_TYPES;
module.exports = EnemyManager;
