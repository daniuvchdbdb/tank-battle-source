const Button = require('../ui/Button');
const CowSkinRenderer = require('../renderers/CowSkinRenderer');
const DrawUtil = require('../utils/DrawUtil');
const Particle = require('../entities/Particle');
const GameConfig = require('../config/GameConfig');
const PlayerData = require('../managers/PlayerDataManager');
const Theme = require('../config/Theme');

const rarityColor = Theme.rarity;

class SkinScene {
  constructor(app) {
    this.app = app; this.scroll = 0; this.dragY = 0; this.startY = 0; this.dragging = false; this.particles = []; this.cardAreas = [];
    this.back = new Button({ x: 16, y: 18, w: 72, h: 38, text: '返回', color: '#ffcf65', onTap: () => app.scene.change('Home') });
  }
  showDetail(skin) {
    const owned = this.app.skins.isOwned(skin.id);
    const current = this.app.skins.getCurrentSkin() === skin.id;
    const coins = PlayerData.getCoins();
    const gap = skin.price && !owned ? Math.max(0, skin.price - coins) : 0;
    this.app.modal.show({
      title: skin.name,
      message: skin.rarity + ' · ' + skin.effectText + '\n' + (owned ? (current ? '正在穿这套，奶牛很满意。' : '已拥有，点击使用就能换装。') : skin.paid ? '礼包限定，当前为占位展示。' : gap ? '还差 ' + gap + ' 草币即可解锁。' : skin.unlockText),
      skinId: skin.id,
      cowState: 'record',
      buttons: [
        {
          text: current ? '正在使用' : owned ? '换上它' : skin.paid ? '查看礼包' : '解锁皮肤',
          color: current ? GameConfig.COLORS.green : GameConfig.COLORS.orange,
          disabled: current,
          onTap: () => {
            if (owned && !current) this.app.skins.useSkin(skin.id);
            else if (!owned) this.unlock(skin);
          }
        },
        { text: '再看看', color: GameConfig.COLORS.pink }
      ]
    });
  }
  unlock(skin) {
    if (skin.paid) {
      this.app.modal.show({ title: skin.name, message: '支付功能暂未接入，当前为测试模式。', skinId: skin.id, cowState: 'idle' });
      return;
    }
    if (this.app.skins.unlockSkin(skin.id)) {
      this.app.toast.show('新皮肤解锁！');
      for (let i = 0; i < 42; i++) Particle.burst(this.particles, this.app.width / 2, this.app.height / 2, 1, ['#ffd64a', '#ff9db7', '#8ee27b', '#bca8ff']);
    } else this.app.toast.show('草币不足或暂未满足条件');
  }
  draw(ctx, t) {
    const w = this.app.width, h = this.app.height;
    DrawUtil.drawSoftBackground(ctx, w, h, t, 0);
    DrawUtil.drawTitle(ctx, '皮肤衣柜', w / 2, 68, 32);
    DrawUtil.drawTopPill(ctx, w - 138, 20, '草币 ' + PlayerData.getCoins(), '#fff8da');
    DrawUtil.drawTopPill(ctx, w - 138, 62, '体力 ' + this.app.energy.getEnergy(), '#fff8da');
    this.back.draw(ctx, t);
    this.buttons = [this.back];
    this.cardAreas = [];
    const skins = this.app.skins.getAllSkins();
    const cardW = (w - 42) / 2, cardH = 210;
    skins.forEach((s, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = 14 + col * (cardW + 14);
      const y = 116 + row * (cardH + 14) - this.scroll;
      if (y > h || y + cardH < 92) return;
      ctx.save();
      const owned = this.app.skins.isOwned(s.id), current = this.app.skins.getCurrentSkin() === s.id;
      this.cardAreas.push({ x, y, w: cardW, h: cardH, skin: s });
      DrawUtil.drawSoftCard(ctx, x, y, cardW, cardH, {
        color: current ? '#fff1c2' : '#fff8da',
        top: '#fffdf6',
        bottom: current ? '#ffe7a8' : '#fff0cf',
        radius: 24,
        blur: current ? 18 : 12
      });
      ctx.lineWidth = 4; ctx.strokeStyle = rarityColor[s.rarity] || '#9bdc72';
      Button.roundRect(ctx, x + 2, y + 2, cardW - 4, cardH - 4, 20); ctx.stroke();
      DrawUtil.drawBadge(ctx, s.rarity, x + cardW - 62, y + 8, rarityColor[s.rarity] || '#9bdc72', 54);
      if (current) DrawUtil.drawBadge(ctx, '使用中', x + 10, y + 8, GameConfig.COLORS.orange, 62);
      if (['稀有','史诗','传说','限定'].includes(s.rarity)) {
        ctx.fillStyle = 'rgba(255,216,56,0.72)';
        for (let k = 0; k < 3; k++) DrawUtil.drawSparkle(ctx, x + 20 + k * 22, y + 24 + Math.sin(t * 4 + k) * 3, 5, 'rgba(255,216,56,0.85)', t + k);
      }
      if (current) {
        for (let k = 0; k < 5; k++) DrawUtil.drawSparkle(ctx, x + cardW * 0.2 + k * cardW * 0.15, y + 54 + Math.sin(t * 5 + k) * 7, 5, '#fff6a8', t + k);
      }
      ctx.fillStyle = 'rgba(255,255,255,0.52)';
      ctx.beginPath();
      ctx.ellipse(x + cardW / 2, y + 83, cardW * 0.35, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      CowSkinRenderer.drawCowPreview(ctx, x + cardW / 2, y + 78, current ? 0.58 : 0.54, s.id, t);
      ctx.fillStyle = GameConfig.COLORS.text; ctx.textAlign = 'center'; ctx.font = 'bold 16px sans-serif'; ctx.fillText(s.name, x + cardW / 2, y + 124);
      ctx.font = '12px sans-serif'; ctx.fillText(s.effectText, x + cardW / 2, y + 146);
      let text = current ? '使用中' : owned ? '使用' : (s.price ? s.price + ' 草币' : '查看条件');
      if (!owned && s.price && PlayerData.getCoins() < s.price) {
        ctx.fillStyle = '#ee7f22'; ctx.font = '12px sans-serif';
        ctx.fillText('再攒 ' + (s.price - PlayerData.getCoins()) + ' 草币解锁', x + cardW / 2, y + 164);
      }
      const btn = new Button({ x: x + 16, y: y + 172, w: cardW - 32, h: 32, text, color: current ? '#ffcf65' : owned ? '#72dd73' : '#ffb02e', onTap: () => {
        if (current) return;
        if (owned) { this.app.skins.useSkin(s.id); this.app.toast.show('已换上 ' + s.name); }
        else this.unlock(s);
      }});
      btn.draw(ctx, t); this.buttons.push(btn);
      if (!owned) {
        ctx.fillStyle = 'rgba(255,255,255,0.46)'; Button.roundRect(ctx, x + 6, y + 38, cardW - 12, 119, 18); ctx.fill();
        DrawUtil.drawBadge(ctx, s.paid ? '礼包限定' : '未解锁', x + cardW / 2 - 38, y + 70, 'rgba(92,74,61,0.62)', 76);
      }
      ctx.restore();
    });
    this.particles.forEach(p => p.draw(ctx));
  }
  update(dt) { this.particles.forEach(p => p.update(dt)); this.particles = this.particles.filter(p => !p.dead()); }
  touchStart(x, y) { this.dragY = y; this.startY = y; this.dragging = true; return this.buttons && this.buttons.some(b => b.touchStart(x, y)); }
  touchMove(x, y) { if (this.dragging) { this.scroll = Math.max(0, this.scroll + this.dragY - y); this.dragY = y; } }
  touchEnd(x, y) {
    const moved = Math.abs(y - this.startY) > 8;
    this.dragging = false;
    if (this.buttons && this.buttons.some(b => b.touchEnd(x, y))) return true;
    if (!moved) {
      const card = this.cardAreas.find(a => x >= a.x && x <= a.x + a.w && y >= a.y && y <= a.y + a.h);
      if (card) { this.showDetail(card.skin); return true; }
    }
    return false;
  }
}

module.exports = SkinScene;
