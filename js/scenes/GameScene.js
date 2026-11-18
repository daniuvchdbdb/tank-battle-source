const Button = require('../ui/Button');
const ProgressBar = require('../ui/ProgressBar');
const CowSkinRenderer = require('../renderers/CowSkinRenderer');
const DrawUtil = require('../utils/DrawUtil');
const MathUtil = require('../utils/MathUtil');
const Particle = require('../entities/Particle');
const Coin = require('../entities/Coin');
const GameConfig = require('../config/GameConfig');
const PlayerData = require('../managers/PlayerDataManager');
const GrowthManager = require('../managers/GrowthManager');
const EnemyManager = require('../managers/EnemyManager');
const SkillManager = require('../managers/SkillManager');

const ROUND_MS = 60000;
const COLLECT_TYPES = {
  grass: { name: '小草', xp: 6, coin: 0, size: 9, color: '#77d85d' },
  flower: { name: '花花', xp: 10, coin: 1, size: 10, color: '#ff8bb3' },
  coin: { name: '草币', xp: 2, coin: 5, size: 8, color: '#ffd438' },
  mushroom: { name: '小蘑菇', xp: 14, coin: 2, size: 12, color: '#ff9aa8' },
  star: { name: '星星', xp: 12, coin: 3, size: 11, color: '#fff36d', rage: 3500 }
};

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

class GameScene {
  constructor(app) {
    this.app = app;
    this.worldW = 2200;
    this.worldH = 2200;
    this.camera = { x: 0, y: 0 };
    this.cow = {
      x: this.worldW / 2,
      y: this.worldH / 2,
      vx: 0,
      vy: 0,
      drag: false,
      targetX: app.width / 2,
      targetY: app.height / 2,
      stun: 0,
      rage: 0,
      shieldFlash: 0,
      skinTimer: 0
    };
    this.growth = new GrowthManager();
    this.skills = new SkillManager();
    this.enemies = new EnemyManager(this);
    this.collectibles = [];
    this.particles = [];
    this.skillOffer = [];
    this.state = 'playing';
    this.timeLeft = ROUND_MS;
    this.coins = 0;
    this.hits = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.comboTimer = 0;
    this.bossDefeated = false;
    this.bossSpawned = false;
    this.toastText = '';
    this.toastTimer = 0;
    this.shake = 0;
    this.pauseBtn = new Button({ x: app.width - 62, y: 18, w: 44, h: 38, text: 'Ⅱ', color: '#ff8bb3', onTap: () => app.scene.change('Home') });
    this.expBar = new ProgressBar(72, 58, app.width - 144, 16, 100);
    for (let i = 0; i < 95; i++) this.spawnCollectible(false);
  }

  clampWorld(x, y) {
    return {
      x: MathUtil.clamp(x, 50, this.worldW - 50),
      y: MathUtil.clamp(y, 50, this.worldH - 50)
    };
  }

  worldToScreen(x, y) {
    return { x: x - this.camera.x, y: y - this.camera.y };
  }

  screenToWorld(x, y) {
    return { x: x + this.camera.x, y: y + this.camera.y };
  }

  spawnCollectible(nearCow) {
    const ids = Object.keys(COLLECT_TYPES);
    const type = Math.random() < 0.035 ? 'star' : MathUtil.choose(ids.filter(id => id !== 'star'));
    let p;
    if (nearCow) {
      const a = Math.random() * Math.PI * 2;
      const d = MathUtil.rand(180, 660);
      p = this.clampWorld(this.cow.x + Math.cos(a) * d, this.cow.y + Math.sin(a) * d);
    } else {
      p = this.clampWorld(MathUtil.rand(70, this.worldW - 70), MathUtil.rand(70, this.worldH - 70));
    }
    this.collectibles.push({ type, x: p.x, y: p.y, bob: Math.random() * 10, life: 1 });
  }

  cowSize() {
    const rageBonus = this.cow.rage > 0 ? 12 : 0;
    return this.growth.getSize() + rageBonus;
  }

  hitRadius() {
    return this.cowSize() * (0.78 + this.skills.mods.hitRange + PlayerData.getUpgradeLevel('horn') * 0.01);
  }

  coinRate() {
    const skinBonus = this.app.skins.getSkinBonus('coin') || 0;
    const rageBonus = this.cow.rage > 0 ? 0.25 : 0;
    const comboBonus = Math.min(0.75, this.combo * 0.025);
    return this.growth.getCoinRate() + this.skills.mods.coin + skinBonus + rageBonus + comboBonus + PlayerData.getUpgradeLevel('coinRate') * 0.03;
  }

  addCoins(amount, x, y) {
    const gain = Math.max(0, Math.floor(amount * this.coinRate()));
    this.coins += gain;
    const target = { x: this.app.width - 66, y: 34 };
    for (let i = 0; i < Math.min(8, Math.max(2, Math.ceil(gain / 6))); i++) {
      this.particles.push(new Coin(x || this.app.width / 2, y || this.app.height / 2, target));
    }
  }

  addExp(amount) {
    const levelUps = this.growth.addExp(amount, this.skills.mods.exp);
    if (this.skills.mods.instantGrow > 0) {
      this.growth.addSize(this.skills.mods.instantGrow);
      this.skills.mods.instantGrow = 0;
    }
    if (levelUps > 0) this.openSkillChoice();
  }

  openSkillChoice() {
    if (this.state === 'ended') return;
    this.growth.consumeLevelUp();
    this.state = 'skill';
    this.skillOffer = this.skills.getOffer();
    const w = this.app.width;
    const h = this.app.height;
    this.skillButtons = this.skillOffer.map((skill, i) => new Button({
      x: w * 0.08,
      y: h * 0.31 + i * 92,
      w: w * 0.84,
      h: 76,
      text: skill.name,
      subText: skill.desc,
      color: i === 0 ? '#ffb02e' : i === 1 ? '#72dd73' : '#ff8bb3',
      onTap: () => this.chooseSkill(skill)
    }));
  }

  chooseSkill(skill) {
    this.skills.choose(skill);
    if (this.skills.triggerRage > 0) {
      this.triggerRage(this.skills.triggerRage);
      this.skills.triggerRage = 0;
    }
    if (this.growth.pendingLevels > 0) {
      this.openSkillChoice();
      return;
    }
    this.state = 'playing';
    this.toastText = '学会了：' + skill.name;
    this.toastTimer = 1200;
  }

  triggerRage(ms) {
    this.cow.rage = Math.max(this.cow.rage, ms || 4500);
    this.toastText = '奶凶冲冲！';
    this.toastTimer = 1200;
    Particle.burst(this.particles, this.app.width / 2, this.app.height / 2, 24, ['#fff36d', '#ff8bb3', '#9ee8ff']);
  }

  updateCow(dt) {
    const step = dt / 16.67;
    const screenCow = this.worldToScreen(this.cow.x, this.cow.y);
    if (this.cow.stun > 0) {
      this.cow.stun -= dt;
      this.cow.vx *= 0.93;
      this.cow.vy *= 0.93;
    } else if (this.cow.drag) {
      const dx = this.cow.targetX - screenCow.x;
      const dy = this.cow.targetY - screenCow.y;
      const d = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      const maxSpeed = (4.2 + this.skills.mods.speed * 4.2 + this.app.skins.getSkinBonus('startSpeed') * 2.5 + PlayerData.getUpgradeLevel('hoof') * 0.08) * (this.cow.rage > 0 ? 1.18 : 1);
      const force = Math.min(maxSpeed, d * 0.035);
      this.cow.vx += dx / d * force * 0.32;
      this.cow.vy += dy / d * force * 0.32;
      const speed = Math.sqrt(this.cow.vx * this.cow.vx + this.cow.vy * this.cow.vy);
      if (speed > maxSpeed) {
        this.cow.vx = this.cow.vx / speed * maxSpeed;
        this.cow.vy = this.cow.vy / speed * maxSpeed;
      }
    } else {
      this.cow.vx *= 0.91;
      this.cow.vy *= 0.91;
    }
    this.cow.x += this.cow.vx * step;
    this.cow.y += this.cow.vy * step;
    const p = this.clampWorld(this.cow.x, this.cow.y);
    this.cow.x = p.x;
    this.cow.y = p.y;
    if (this.cow.rage > 0) this.cow.rage -= dt;
    if (this.cow.shieldFlash > 0) this.cow.shieldFlash -= dt;
    this.cow.skinTimer += dt;
    if (this.comboTimer > 0) this.comboTimer -= dt;
    else this.combo = 0;
  }

  updateCamera() {
    this.camera.x = MathUtil.clamp(this.cow.x - this.app.width / 2, 0, this.worldW - this.app.width);
    this.camera.y = MathUtil.clamp(this.cow.y - this.app.height / 2, 0, this.worldH - this.app.height);
  }

  updateCollectibles(dt) {
    while (this.collectibles.length < 95) this.spawnCollectible(true);
    const magnet = this.skills.mods.magnet + (this.app.skins.getCurrentSkin() === 'rainbow' && this.cow.rage > 0 ? 70 : 0);
    this.collectibles.forEach(c => {
      c.bob += dt / 1000;
      const d = dist(c, this.cow);
      if (magnet > 0 && d < magnet) {
        c.x += (this.cow.x - c.x) / Math.max(1, d) * 5 * dt / 16.67;
        c.y += (this.cow.y - c.y) / Math.max(1, d) * 5 * dt / 16.67;
      }
      if (d < this.cowSize() * 0.62 + COLLECT_TYPES[c.type].size) this.eatCollectible(c);
    });
    this.collectibles = this.collectibles.filter(c => c.life > 0);
  }

  eatCollectible(c) {
    const cfg = COLLECT_TYPES[c.type];
    c.life = 0;
    const sp = this.worldToScreen(c.x, c.y);
    const luckRate = 1 + PlayerData.getUpgradeLevel('luck') * 0.015;
    this.addExp(cfg.xp * luckRate);
    if (cfg.coin) this.addCoins(cfg.coin * luckRate, sp.x, sp.y);
    if (cfg.rage) this.triggerRage(cfg.rage);
    Particle.burst(this.particles, sp.x, sp.y, c.type === 'star' ? 16 : 6, [cfg.color, '#fff8da', '#72dd73']);
  }

  updateSkills(dt) {
    if (this.skills.mods.starDash) {
      this.skills.starTimer -= dt;
      if (this.skills.starTimer <= 0) {
        this.skills.starTimer = 8000;
        this.cow.vx *= 1.8;
        this.cow.vy *= 1.8;
        this.triggerRage(1200);
      }
    }
    if (this.skills.mods.shadow > 0) {
      this.skills.shadowTimer -= dt;
      if (this.skills.shadowTimer <= 0) {
        this.skills.shadowTimer = 900;
        const e = this.enemies.enemies.find(v => !v.knocked && v.size <= this.cowSize() + 8 && dist(v, this.cow) < 260);
        if (e) this.knockEnemy(e, true);
      }
    }
    const skin = this.app.skins.getCurrentSkin();
    if (skin === 'star_pajama') {
      this.cow.skinTimer += dt;
      if (this.cow.skinTimer > 10000) {
        this.cow.skinTimer = 0;
        const e = this.enemies.enemies.find(v => !v.knocked && v.size < this.cowSize() + 10);
        if (e) this.knockEnemy(e, true);
      }
    }
    if (skin === 'dino') {
      const speed = Math.sqrt(this.cow.vx * this.cow.vx + this.cow.vy * this.cow.vy);
      if (speed < 0.7 && this.cow.skinTimer > 4500) {
        this.cow.skinTimer = 0;
        this.cow.vx += 4;
        this.triggerRage(900);
      }
    }
  }

  updateCollisions() {
    for (const e of this.enemies.enemies) {
      if (e.knocked) continue;
      const d = dist(e, this.cow);
      if (d < this.hitRadius() + e.size * 0.45) {
        if (this.growth.getImpactPower() + PlayerData.getUpgradeLevel('horn') * 1.5 + (this.cow.rage > 0 ? 22 : 0) >= e.size) this.knockEnemy(e);
        else this.bumpCow(e);
      }
    }
    const boss = this.enemies.boss;
    if (boss && !boss.defeated && dist(boss, this.cow) < this.hitRadius() + boss.size * 0.45) {
      if (this.growth.level >= 6 || this.cow.rage > 0 || this.growth.getImpactPower() + PlayerData.getUpgradeLevel('horn') * 1.5 > boss.size * 0.82) {
        boss.hp -= this.cow.rage > 0 ? 2 : 1;
        this.bumpBoss(boss);
        if (boss.hp <= 0) this.defeatBoss(boss);
      } else this.bumpCow(boss);
    }
  }

  knockEnemy(e, byShadow) {
    const sp = this.worldToScreen(e.x, e.y);
    this.enemies.knockEnemy(e, this.cow, this.growth.getImpactPower());
    this.hits += 1;
    this.combo += 1;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    this.comboTimer = 1800;
    let xp = e.cfg.xp;
    let coin = e.cfg.coin;
    const skin = this.app.skins.getCurrentSkin();
    if (skin === 'strawberry' && Math.random() < 0.28) xp += 5;
    if (skin === 'milk_tea' && Math.random() < 0.18) {
      const near = this.enemies.enemies.find(v => !v.knocked && v !== e && dist(v, e) < 95 && v.size <= this.cowSize() + 10);
      if (near) this.enemies.knockEnemy(near, e, 120);
    }
    if (skin === 'peach' && this.combo === 20) coin += 40;
    this.addExp(xp);
    this.addCoins(coin, sp.x, sp.y);
    Particle.burst(this.particles, sp.x, sp.y, 14, ['#ffd438', '#9ee8ff', '#ff8bb3']);
    this.app.audio.hit();
    this.shake = 120;
    if (this.combo > 0 && this.combo % 12 === 0) this.triggerRage(2600);
    if ((e.type === 'hay' && this.skills.mods.hayChain) || e.type === 'hay') this.chainHay(e);
  }

  chainHay(source) {
    let count = 0;
    this.enemies.enemies.forEach(e => {
      if (!e.knocked && e !== source && count < 5 && dist(e, source) < 130 && e.size < this.cowSize() + 22) {
        this.enemies.knockEnemy(e, source, 120);
        count++;
        this.hits++;
        this.addExp(Math.floor(e.cfg.xp * 0.5));
        this.addCoins(Math.floor(e.cfg.coin * 0.5), this.worldToScreen(e.x, e.y).x, this.worldToScreen(e.x, e.y).y);
      }
    });
  }

  bumpCow(enemy) {
    if (this.skills.mods.shield > 0 || this.cow.shieldFlash > 0 || (this.app.skins.getCurrentSkin() === 'cloud' && Math.random() < 0.25)) {
      this.skills.mods.shield = Math.max(0, this.skills.mods.shield - 1);
      this.cow.shieldFlash = 700;
      this.toastText = '花花护盾挡住啦！';
      this.toastTimer = 900;
      return;
    }
    const d = Math.max(1, dist(enemy, this.cow));
    this.cow.vx = (this.cow.x - enemy.x) / d * 9;
    this.cow.vy = (this.cow.y - enemy.y) / d * 9;
    const skinReduce = this.app.skins.getCurrentSkin() === 'panda' && (enemy.type === 'stone' || enemy.cfg && enemy.cfg.id === 'boss_stone') ? 0.35 : 0;
    const bellyReduce = Math.min(0.35, PlayerData.getUpgradeLevel('belly') * 0.025);
    this.cow.stun = Math.max(130, 650 * (1 - this.skills.mods.stunReduce - skinReduce - bellyReduce));
    this.combo = 0;
    this.shake = 180;
    this.app.audio.hit();
  }

  bumpBoss(boss) {
    const d = Math.max(1, dist(boss, this.cow));
    this.cow.vx = (this.cow.x - boss.x) / d * 4;
    this.cow.vy = (this.cow.y - boss.y) / d * 4;
    const sp = this.worldToScreen(boss.x, boss.y);
    Particle.burst(this.particles, sp.x, sp.y, 18, ['#ffd438', '#ff8bb3', '#fff8da']);
    this.shake = 160;
  }

  defeatBoss(boss) {
    boss.defeated = true;
    this.bossDefeated = true;
    const sp = this.worldToScreen(boss.x, boss.y);
    this.addExp(180);
    this.addCoins(180, sp.x, sp.y);
    Particle.burst(this.particles, sp.x, sp.y, 46, ['#ffd438', '#ff8bb3', '#9ee8ff', '#fff8da']);
    this.toastText = '大捣蛋怪被顶飞啦！';
    this.toastTimer = 1800;
  }

  update(dt) {
    if (this.state === 'skill') {
      this.particles.forEach(p => p.update(dt));
      this.particles = this.particles.filter(p => !p.dead());
      return;
    }
    if (this.state !== 'playing') return;
    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.finish();
      return;
    }
    if (!this.bossSpawned && this.timeLeft <= 20000) {
      this.bossSpawned = true;
      this.enemies.spawnBoss();
    }
    this.updateCow(dt);
    this.updateCamera();
    this.enemies.update(dt);
    this.updateCollectibles(dt);
    this.updateSkills(dt);
    this.updateCollisions();
    this.particles.forEach(p => p.update(dt));
    this.particles = this.particles.filter(p => !p.dead());
    if (this.shake > 0) this.shake -= dt;
    if (this.toastTimer > 0) this.toastTimer -= dt;
  }

  finish() {
    this.state = 'ended';
    const score = this.growth.level * 100 + this.hits * 8 + this.bestCombo * 5 + (this.bossDefeated ? 300 : 0);
    const result = {
      mode: 'growth',
      distance: score,
      coins: Math.floor(this.coins),
      level: this.growth.level,
      hits: this.hits,
      bestCombo: this.bestCombo,
      bossDefeated: this.bossDefeated,
      skills: this.skills.getOwned().length,
      skinId: this.app.skins.getCurrentSkin(),
      oldBest: PlayerData.getBestDistance()
    };
    PlayerData.addCoins(result.coins);
    PlayerData.recordGame(result);
    this.app.tasks.addProgress('play', 1);
    this.app.tasks.addProgress('hit', this.hits);
    this.app.tasks.addProgress('coin', result.coins);
    this.app.skins.consumeTrialIfNeeded();
    this.app.cloud.uploadScore(score);
    this.app.scene.change('Result', result);
  }

  drawGround(ctx, t) {
    const g = ctx.createLinearGradient(0, 0, 0, this.app.height);
    g.addColorStop(0, '#c8f39a');
    g.addColorStop(0.45, '#9be26b');
    g.addColorStop(1, '#80d65e');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.app.width, this.app.height);
    ctx.save();
    ctx.globalAlpha = 0.24;
    ctx.fillStyle = '#fff8da';
    ctx.beginPath();
    ctx.ellipse(this.app.width * 0.25 - (this.camera.x * 0.05) % 80, this.app.height * 0.18 - (this.camera.y * 0.03) % 50, 190, 70, -0.2, 0, Math.PI * 2);
    ctx.ellipse(this.app.width * 0.82 - (this.camera.x * 0.04) % 60, this.app.height * 0.34 - (this.camera.y * 0.02) % 40, 160, 58, 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#83d95d';
    for (let x = -((this.camera.x * 0.6) % 80); x < this.app.width + 80; x += 80) {
      for (let y = -((this.camera.y * 0.6) % 80); y < this.app.height + 80; y += 80) {
        ctx.globalAlpha = 0.18;
        ctx.beginPath();
        ctx.arc(x + 18, y + 28, 9, 0, Math.PI * 2);
        ctx.arc(x + 54, y + 58, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    for (let x = -((this.camera.x * 0.28) % 120); x < this.app.width + 120; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, this.app.height * 0.08);
      ctx.quadraticCurveTo(x + 24, this.app.height * 0.12, x + 48, this.app.height * 0.08);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(99,189,87,0.18)';
    Button.roundRect(ctx, 8, 86, this.app.width - 16, this.app.height - 98, 26);
    ctx.strokeStyle = 'rgba(255,255,255,0.24)';
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  drawCollectible(ctx, c, t) {
    const cfg = COLLECT_TYPES[c.type];
    const sp = this.worldToScreen(c.x, c.y);
    const bob = Math.sin(t * 4 + c.bob) * 3;
    ctx.save();
    ctx.translate(sp.x, sp.y + bob);
    ctx.shadowColor = 'rgba(92,74,61,0.16)';
    ctx.shadowBlur = 7;
    ctx.shadowOffsetY = 4;
    if (c.type === 'grass') {
      ctx.strokeStyle = '#5faf57';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      for (let i = -1; i <= 1; i++) line(ctx, i * 5, 8, i * 2, -8, '#5faf57', 5);
      for (let i = -1; i <= 1; i++) line(ctx, i * 5, 7, i * 2, -8, '#9be26b', 3);
    } else if (c.type === 'flower') {
      for (let i = 0; i < 5; i++) {
        const a = i * Math.PI * 2 / 5;
        ctx.fillStyle = '#ff8bb3';
        ctx.beginPath();
        ctx.arc(Math.cos(a) * 7, Math.sin(a) * 7, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.76)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.fillStyle = '#ffd438';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (c.type === 'coin') {
      ctx.fillStyle = '#ffd438';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff5a8';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.38)';
      ctx.beginPath();
      ctx.arc(-3, -3, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (c.type === 'mushroom') {
      ctx.fillStyle = '#ff9aa8';
      ctx.beginPath();
      ctx.arc(0, -2, 12, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8a542f';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#fff2dc';
      Button.roundRect(ctx, -5, -2, 10, 13, 4);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath();
      ctx.arc(-5, -7, 3, 0, Math.PI * 2);
      ctx.arc(4, -10, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#fff36d';
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + i * Math.PI / 5;
        const r = i % 2 ? 5 : 12;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fff8da';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.shadowColor = 'transparent';
    ctx.restore();
  }

  drawCow(ctx, t) {
    const sp = this.worldToScreen(this.cow.x, this.cow.y);
    const sizeScale = this.cowSize() / 48;
    const state = this.cow.stun > 0 ? 'hit' : this.cow.rage > 0 ? 'rage' : Math.abs(this.cow.vx) + Math.abs(this.cow.vy) > 1.2 ? 'running' : 'idle';
    if (this.cow.rage > 0) {
      ctx.save();
      ctx.globalAlpha = 0.38 + Math.sin(t * 8) * 0.08;
      ctx.fillStyle = '#fff36d';
      ctx.beginPath();
      ctx.arc(sp.x + 62 * sizeScale, sp.y + 45 * sizeScale, this.cowSize() * 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    if (this.skills.mods.shadow > 0) {
      ctx.save();
      ctx.globalAlpha = 0.28;
      CowSkinRenderer.drawCow(ctx, sp.x - 42, sp.y - 34, 0.7 * sizeScale, this.app.skins.getCurrentSkin(), 'running', t);
      ctx.restore();
    }
    CowSkinRenderer.drawCow(ctx, sp.x - 82 * sizeScale, sp.y - 74 * sizeScale, 0.88 * sizeScale, this.app.skins.getCurrentSkin(), state, t);
  }

  drawHud(ctx, t) {
    const w = this.app.width;
    DrawUtil.drawSoftCard(ctx, 8, 8, w - 16, 78, { color: 'rgba(255,248,218,0.88)', radius: 22, blur: 8, offsetY: 3 });
    DrawUtil.drawTopPill(ctx, 16, 18, 'Lv.' + this.growth.level, '#fff8da');
    DrawUtil.drawTopPill(ctx, w - 136, 18, '草币 ' + Math.floor(this.coins), '#fff8da');
    ctx.fillStyle = GameConfig.COLORS.text;
    ctx.textAlign = 'center';
    ctx.font = 'bold 20px sans-serif';
    DrawUtil.drawOutlinedText(ctx, Math.ceil(this.timeLeft / 1000) + ' 秒', w / 2, 36, 20, '#ffb02e', '#8a542f', 4);
    this.expBar.value = this.growth.getXpProgress() * 100;
    this.expBar.draw(ctx, '#72dd73');
    ctx.font = 'bold 15px sans-serif';
    ctx.fillStyle = '#7a542e';
    ctx.fillText('经验', w / 2, 70);
    if (this.combo > 1) {
      DrawUtil.drawOutlinedText(ctx, '连击 x' + this.combo, w / 2, 112, 25, '#ff7b29', '#8a542f', 5);
    }
    if (this.cow.rage > 0) {
      DrawUtil.drawOutlinedText(ctx, '奶凶冲冲！', w / 2, 142, 24, '#ff8bb3', '#8a542f', 5);
    }
    this.skills.getOwned().slice(-6).forEach((s, i) => {
      ctx.fillStyle = '#fff8da';
      ctx.shadowColor = 'rgba(122,82,30,0.16)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 3;
      ctx.beginPath();
      ctx.arc(w - 28, 88 + i * 34, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = '#8a542f';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(s.icon, w - 28, 93 + i * 34);
    });
    if (this.toastTimer > 0) {
      ctx.font = 'bold 20px sans-serif';
      DrawUtil.drawOutlinedText(ctx, this.toastText, w / 2, this.app.height * 0.22, 22, '#fff8da', '#8a542f', 5);
    }
    this.pauseBtn.draw(ctx, t);
  }

  drawSkillChoice(ctx, t) {
    ctx.fillStyle = 'rgba(122,82,30,0.28)';
    ctx.fillRect(0, 0, this.app.width, this.app.height);
    DrawUtil.drawSoftCard(ctx, this.app.width * 0.05, this.app.height * 0.22, this.app.width * 0.9, this.app.height * 0.5, { color: '#fff8da', radius: 30, blur: 18 });
    ctx.fillStyle = GameConfig.COLORS.text;
    ctx.textAlign = 'center';
    DrawUtil.drawOutlinedText(ctx, '小牛升级啦！', this.app.width / 2, this.app.height * 0.275, 26, '#ffb02e', '#8a542f', 5);
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('选一个贴纸技能继续乱撞', this.app.width / 2, this.app.height * 0.31);
    this.skillButtons.forEach((b, i) => {
      b.draw(ctx, t);
      ctx.fillStyle = '#fff8da';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(this.skillOffer[i].icon, b.x + 28, b.y + 43);
    });
  }

  draw(ctx, t) {
    const dx = this.shake > 0 ? Math.sin(t * 80) * 4 : 0;
    ctx.save();
    ctx.translate(dx, 0);
    this.drawGround(ctx, t);
    this.collectibles.forEach(c => this.drawCollectible(ctx, c, t));
    this.enemies.enemies.forEach(e => {
      const sp = this.worldToScreen(e.x, e.y);
      if (sp.x > -120 && sp.y > -120 && sp.x < this.app.width + 120 && sp.y < this.app.height + 120) this.enemies.drawEnemy(ctx, e, sp.x, sp.y, t);
    });
    if (this.enemies.boss && !this.enemies.boss.defeated) {
      const sp = this.worldToScreen(this.enemies.boss.x, this.enemies.boss.y);
      this.enemies.drawBoss(ctx, this.enemies.boss, sp.x, sp.y);
    }
    this.drawCow(ctx, t);
    this.particles.forEach(p => p.draw(ctx));
    ctx.restore();
    this.drawHud(ctx, t);
    if (this.state === 'skill') this.drawSkillChoice(ctx, t);
  }

  touchStart(x, y) {
    if (this.state === 'skill') return this.skillButtons.some(b => b.touchStart(x, y));
    this.cow.drag = true;
    this.cow.targetX = x;
    this.cow.targetY = y;
    return this.pauseBtn.touchStart(x, y);
  }

  touchMove(x, y) {
    if (this.state === 'skill') return;
    this.cow.targetX = x;
    this.cow.targetY = y;
  }

  touchEnd(x, y) {
    if (this.state === 'skill') return this.skillButtons.some(b => b.touchEnd(x, y));
    this.cow.drag = false;
    return this.pauseBtn.touchEnd(x, y);
  }
}

module.exports = GameScene;
