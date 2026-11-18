const Button = require('../ui/Button');
const GameConfig = require('../config/GameConfig');
const Assets = require('../managers/AssetManager');

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  if (ctx.ellipse) ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  else {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(rx, ry);
    ctx.arc(0, 0, 1, 0, Math.PI * 2);
    ctx.restore();
  }
}

function fillEllipse(ctx, x, y, rx, ry, color) {
  ellipse(ctx, x, y, rx, ry);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawSparkle(ctx, x, y, r, color, t) {
  const pulse = 1 + Math.sin((t || 0) * 5 + x * 0.03) * 0.15;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(pulse, pulse);
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.lineTo(r * 0.28, -r * 0.28);
  ctx.lineTo(r, 0);
  ctx.lineTo(r * 0.28, r * 0.28);
  ctx.lineTo(0, r);
  ctx.lineTo(-r * 0.28, r * 0.28);
  ctx.lineTo(-r, 0);
  ctx.lineTo(-r * 0.28, -r * 0.28);
  ctx.closePath();
  ctx.fillStyle = color || '#fff6a8';
  ctx.fill();
  ctx.restore();
}

function drawSoftBackground(ctx, w, h, t, scroll) {
  const c = GameConfig.COLORS;
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, c.sky);
  sky.addColorStop(0.35, c.sky2);
  sky.addColorStop(0.72, c.cream);
  sky.addColorStop(1, '#ffe9b8');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  fillEllipse(ctx, w * 0.16, h * 0.16, w * 0.42, h * 0.18, 'rgba(255,255,255,0.22)');
  fillEllipse(ctx, w * 0.86, h * 0.34, w * 0.36, h * 0.16, 'rgba(255,235,174,0.22)');
  ctx.fillStyle = 'rgba(255,255,255,0.62)';
  for (let i = 0; i < 5; i++) {
    const x = (i * 130 - (scroll || 0) * 0.08) % (w + 160) - 80;
    const y = 70 + (i % 2) * 38 + Math.sin(t + i) * 5;
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.arc(x + 28, y - 8, 30, 0, Math.PI * 2);
    ctx.arc(x + 58, y, 22, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 8; i++) {
    drawSparkle(ctx, (i * 67 + Math.sin(t + i) * 8) % (w + 40) - 20, 70 + (i % 4) * 58, 5 + (i % 3), 'rgba(255,255,255,0.58)', t + i);
  }
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.lineWidth = 8;
  const rainbowX = w * 0.78 - ((scroll || 0) * 0.03) % 50;
  const rainbowY = h * 0.26 + Math.sin(t * 0.8) * 4;
  ['#ff9db7', '#ffd978', '#8ee27b', '#8bd7ff', '#bca8ff'].forEach((col, i) => {
    ctx.strokeStyle = col;
    ctx.beginPath();
    ctx.arc(rainbowX, rainbowY, 92 - i * 10, Math.PI * 1.08, Math.PI * 1.78);
    ctx.stroke();
  });
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(-30, h * 0.62);
  ctx.quadraticCurveTo(w * 0.18, h * 0.5, w * 0.38, h * 0.62);
  ctx.quadraticCurveTo(w * 0.55, h * 0.47, w * 0.78, h * 0.62);
  ctx.quadraticCurveTo(w * 0.94, h * 0.52, w + 40, h * 0.62);
  ctx.lineTo(w + 40, h * 0.7);
  ctx.lineTo(-30, h * 0.7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#c8f39a';
  ellipse(ctx, w * 0.5, h * 0.72, w * 0.72, h * 0.12);
  ctx.fill();
  const grass = ctx.createLinearGradient(0, h * 0.66, 0, h);
  grass.addColorStop(0, c.grassLight);
  grass.addColorStop(0.55, c.grass);
  grass.addColorStop(1, '#80d65e');
  ctx.fillStyle = grass;
  ctx.fillRect(0, h * 0.68, w, h * 0.32);
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  for (let x = -40 - ((scroll || 0) * 0.3) % 70; x < w + 70; x += 70) {
    Button.roundRect(ctx, x, h * 0.75, 42, 10, 5);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(99,189,87,0.22)';
  for (let x = -20 - ((scroll || 0) * 0.18) % 64; x < w + 64; x += 64) {
    for (let y = h * 0.72; y < h; y += 58) {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.arc(x + 20, y + 18, 3, 0, Math.PI * 2);
      ctx.arc(x + 42, y + 7, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.save();
  ctx.globalAlpha = 0.52;
  for (let i = 0; i < 10; i++) {
    const x = (i * 53 - ((scroll || 0) * 0.22) % 53) % (w + 50) - 20;
    const y = h * (0.76 + (i % 4) * 0.055);
    ctx.fillStyle = i % 2 ? c.pinkLight : c.cream3;
    for (let k = 0; k < 5; k++) {
      const a = k * Math.PI * 2 / 5;
      ellipse(ctx, x + Math.cos(a) * 4, y + Math.sin(a) * 4, 3.2, 3.2);
      ctx.fill();
    }
    ctx.fillStyle = c.orangeLight;
    ellipse(ctx, x, y, 2.5, 2.5);
    ctx.fill();
  }
  ctx.restore();
}

function drawTopPill(ctx, x, y, text, color) {
  ctx.save();
  ctx.shadowColor = GameConfig.COLORS.shadow;
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 5;
  Button.roundRect(ctx, x, y, 118, 36, 18);
  const g = ctx.createLinearGradient(x, y, x, y + 36);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(1, color || '#fff8da');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.stroke();
  ctx.fillStyle = GameConfig.COLORS.text;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(text, x + 59, y + 18);
  ctx.restore();
}

function drawImageOrFallback(ctx, key, fallbackFn, x, y, w, h) {
  const img = Assets.getImage(key);
  if (img) {
    if (typeof x === 'number') ctx.drawImage(img, x, y, w, h);
    else ctx.drawImage(img, 0, 0);
    return true;
  }
  if (fallbackFn) fallbackFn();
  return false;
}

function drawSoftCard(ctx, x, y, w, h, opts) {
  opts = opts || {};
  const img = opts.useImage && opts.imageKey ? Assets.getImage(opts.imageKey) : null;
  ctx.save();
  ctx.shadowColor = opts.shadow || GameConfig.COLORS.shadow;
  ctx.shadowBlur = opts.blur || 16;
  ctx.shadowOffsetY = opts.offsetY || 7;
  if (img) {
    ctx.drawImage(img, x, y, w, h);
    ctx.shadowColor = 'transparent';
    Button.roundRect(ctx, x + 4, y + 4, w - 8, Math.max(18, h * 0.18), opts.radius || 20);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fill();
  } else {
    Button.roundRect(ctx, x, y, w, h, opts.radius || 22);
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, opts.top || '#fffdf1');
    g.addColorStop(0.58, opts.color || GameConfig.COLORS.cream2);
    g.addColorStop(1, opts.bottom || '#ffefbd');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = opts.lineWidth || 3;
    ctx.strokeStyle = opts.stroke || 'rgba(255,255,255,0.86)';
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(138,84,47,0.1)';
    ctx.stroke();
    Button.roundRect(ctx, x + 10, y + 8, w - 20, Math.max(14, h * 0.16), 12);
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fill();
    Button.roundRect(ctx, x + 12, y + h - 12, w - 24, 5, 3);
    ctx.fillStyle = 'rgba(138,84,47,0.08)';
    ctx.fill();
  }
  ctx.restore();
}

function drawBadge(ctx, text, x, y, color, w) {
  const width = w || Math.max(46, text.length * 14 + 18);
  ctx.save();
  ctx.shadowColor = 'rgba(126,83,38,0.16)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  Button.roundRect(ctx, x, y, width, 24, 12);
  ctx.fillStyle = color || GameConfig.COLORS.pink;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.stroke();
  ctx.fillStyle = '#fffdf4';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(text, x + width / 2, y + 12);
  ctx.restore();
}

function drawOutlinedText(ctx, text, x, y, size, fill, stroke, width) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 ' + size + 'px sans-serif';
  ctx.lineJoin = 'round';
  ctx.lineWidth = width || Math.max(4, size * 0.13);
  ctx.strokeStyle = stroke || GameConfig.COLORS.stroke;
  ctx.strokeText(text, x, y);
  ctx.lineWidth = Math.max(2, size * 0.05);
  ctx.strokeStyle = 'rgba(255,255,255,0.82)';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill || GameConfig.COLORS.orange;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawSectionTitle(ctx, text, x, y) {
  ctx.save();
  drawBadge(ctx, text, x - Math.max(54, text.length * 13) / 2, y - 14, GameConfig.COLORS.orange, Math.max(54, text.length * 13));
  ctx.restore();
}

function drawCuteIcon(ctx, type, x, y, size, t) {
  const key = {
    coin: 'ui.icon.coin',
    energy: 'ui.icon.energy',
    task: 'ui.icon.task',
    skin: 'ui.icon.skin',
    shop: 'ui.icon.shop',
    rank: 'ui.icon.rank',
    upgrade: 'ui.icon.upgrade'
  }[type] || type;
  const img = Assets.getImage(key);
  ctx.save();
  ctx.shadowColor = 'rgba(126,83,38,0.16)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  fillEllipse(ctx, x, y + size * 0.04, size * 0.54, size * 0.5, 'rgba(255,255,255,0.55)');
  ctx.restore();
  if (img) {
    const bob = Math.sin((t || 0) * 4) * size * 0.03;
    ctx.drawImage(img, x - size / 2, y - size / 2 + bob, size, size);
    return;
  }
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#ffd438';
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8a542f';
  ctx.font = 'bold ' + Math.floor(size * 0.36) + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(type[0] || '草', 0, 1);
  ctx.restore();
}

function drawTitle(ctx, text, x, y, size) {
  drawOutlinedText(ctx, text, x, y, size, '#ffb02e', '#8a542f', Math.max(7, size * 0.15));
}

module.exports = {
  drawSoftBackground,
  drawTopPill,
  drawTitle,
  drawImageOrFallback,
  drawCuteIcon,
  drawSoftCard,
  drawBadge,
  drawOutlinedText,
  drawSectionTitle,
  drawSparkle,
  fillEllipse
};
