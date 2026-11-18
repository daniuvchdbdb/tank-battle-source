function ellipse(ctx, x, y, rx, ry, color, stroke) {
  ctx.beginPath();
  if (ctx.ellipse) ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  else {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(rx, ry);
    ctx.arc(0, 0, 1, 0, Math.PI * 2);
    ctx.restore();
  }
  ctx.fillStyle = color;
  ctx.fill();
  if (stroke) {
    ctx.lineWidth = stroke.w || 2;
    ctx.strokeStyle = stroke.color;
    ctx.stroke();
  }
}

function verticalGradient(ctx, x, y, ry, top, mid, bottom) {
  if (!ctx.createLinearGradient) return mid || top;
  const g = ctx.createLinearGradient(x, y - ry, x, y + ry);
  g.addColorStop(0, top);
  g.addColorStop(0.52, mid || top);
  g.addColorStop(1, bottom || mid || top);
  return g;
}

function translucent(color, alpha) {
  if (!color || color[0] !== '#') return color;
  const n = parseInt(color.slice(1), 16);
  return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + alpha + ')';
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

function curve(ctx, x1, y1, cx, cy, x2, y2, color, w) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(cx, cy, x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = w || 2;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function blob(ctx, points, color, stroke) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    const p = points[i];
    const n = points[(i + 1) % points.length];
    ctx.quadraticCurveTo(p[0], p[1], (p[0] + n[0]) / 2, (p[1] + n[1]) / 2);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  if (stroke) {
    ctx.lineWidth = stroke.w || 2;
    ctx.strokeStyle = stroke.color;
    ctx.stroke();
  }
}

function heart(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.beginPath();
  ctx.moveTo(0, 7);
  ctx.bezierCurveTo(-13, -4, -7, -17, 0, -9);
  ctx.bezierCurveTo(7, -17, 13, -4, 0, 7);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function star(ctx, x, y, r, color) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const rr = i % 2 ? r * 0.45 : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function roundRect(ctx, x, y, w, h, r, color, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  if (stroke) {
    ctx.lineWidth = stroke.w || 2;
    ctx.strokeStyle = stroke.color;
    ctx.stroke();
  }
}

function defaultOptions() {
  return {
    bodyColor: '#fffdf4',
    headColor: '#fff8e9',
    spotColor: '#4b2d1f',
    hornColor: '#f5d99b',
    earColor: '#fff2dc',
    innerEarColor: '#ffc2cf',
    muzzleColor: '#ffe2c7',
    hoofColor: '#5a3324',
    blushColor: '#ff9fb4',
    outlineColor: '#8a542f',
    eyeStyle: 'normal',
    expression: 'idle',
    extraDecorations: null
  };
}

function drawSpots(ctx, o, p, s) {
  const stroke = { color: o.outlineColor, w: 1.6 * s };
  blob(ctx, [[p.bodyX - 37 * s, p.bodyY - 13 * s], [p.bodyX - 13 * s, p.bodyY - 27 * s], [p.bodyX + 5 * s, p.bodyY - 8 * s], [p.bodyX - 2 * s, p.bodyY + 15 * s], [p.bodyX - 31 * s, p.bodyY + 13 * s]], o.spotColor, stroke);
  blob(ctx, [[p.bodyX + 21 * s, p.bodyY + 4 * s], [p.bodyX + 52 * s, p.bodyY - 4 * s], [p.bodyX + 65 * s, p.bodyY + 24 * s], [p.bodyX + 34 * s, p.bodyY + 31 * s]], o.spotColor, stroke);
  blob(ctx, [[p.bodyX - 74 * s, p.bodyY + 8 * s], [p.bodyX - 53 * s, p.bodyY + 2 * s], [p.bodyX - 42 * s, p.bodyY + 25 * s], [p.bodyX - 70 * s, p.bodyY + 32 * s]], o.spotColor, stroke);
  blob(ctx, [[p.headX + 20 * s, p.headY - 37 * s], [p.headX + 44 * s, p.headY - 25 * s], [p.headX + 34 * s, p.headY - 4 * s], [p.headX + 12 * s, p.headY - 12 * s]], o.spotColor, stroke);
}

function drawEyes(ctx, o, p, s) {
  const ex1 = p.headX - 19 * s;
  const ex2 = p.headX + 21 * s;
  const ey = p.headY - 4 * s;
  if (o.expression === 'hit') {
    line(ctx, ex1 - 7 * s, ey - 7 * s, ex1 + 7 * s, ey + 7 * s, '#4d2a18', 3 * s);
    line(ctx, ex1 + 7 * s, ey - 7 * s, ex1 - 7 * s, ey + 7 * s, '#4d2a18', 3 * s);
    line(ctx, ex2 - 7 * s, ey - 7 * s, ex2 + 7 * s, ey + 7 * s, '#4d2a18', 3 * s);
    line(ctx, ex2 + 7 * s, ey - 7 * s, ex2 - 7 * s, ey + 7 * s, '#4d2a18', 3 * s);
    star(ctx, p.headX + 50 * s, p.headY - 42 * s, 9 * s, '#ffd438');
    return;
  }
  if (o.eyeStyle === 'blink') {
    line(ctx, ex1 - 8 * s, ey, ex1 + 8 * s, ey, '#4d2a18', 3 * s);
    ellipse(ctx, ex2, ey, 7 * s, 9 * s, '#4d2a18');
    ellipse(ctx, ex2 - 2 * s, ey - 3 * s, 2 * s, 2 * s, '#fff');
    return;
  }
  const eyeColor = o.expression === 'record' || o.expression === 'rage' ? '#ffb02e' : '#3c2418';
  const eyeW = o.expression === 'sad' ? 10 * s : 8 * s;
  const eyeH = o.expression === 'sad' ? 13 * s : 10 * s;
  ellipse(ctx, ex1, ey, eyeW, eyeH, eyeColor);
  ellipse(ctx, ex2, ey, eyeW, eyeH, eyeColor);
  ellipse(ctx, ex1 - 3 * s, ey - 4 * s, 2.5 * s, 2.5 * s, '#fff');
  ellipse(ctx, ex2 - 3 * s, ey - 4 * s, 2.5 * s, 2.5 * s, '#fff');
}

function drawExpression(ctx, o, p, s) {
  const mx = p.headX + 1 * s;
  const my = p.headY + 42 * s;
  if (o.expression === 'running' || o.expression === 'record' || o.expression === 'rage') {
    ctx.beginPath();
    ctx.arc(mx, my, 10 * s, 0, Math.PI);
    ctx.strokeStyle = '#7d3f22';
    ctx.lineWidth = 3 * s;
    ctx.stroke();
  } else if (o.expression === 'sad') {
    ctx.beginPath();
    ctx.arc(mx, my + 9 * s, 9 * s, Math.PI, Math.PI * 2);
    ctx.strokeStyle = '#7d3f22';
    ctx.lineWidth = 3 * s;
    ctx.stroke();
    ellipse(ctx, p.headX + 43 * s, p.headY + 7 * s, 4 * s, 9 * s, '#78d9ff');
  } else if (o.expression === 'charging') {
    line(ctx, mx - 9 * s, my, mx + 9 * s, my, '#7d3f22', 4 * s);
    line(ctx, p.headX - 31 * s, p.headY - 21 * s, p.headX - 9 * s, p.headY - 15 * s, '#5b2d19', 4 * s);
    line(ctx, p.headX + 34 * s, p.headY - 21 * s, p.headX + 12 * s, p.headY - 15 * s, '#5b2d19', 4 * s);
  } else {
    ctx.beginPath();
    ctx.arc(mx, my, 8 * s, 0, Math.PI);
    ctx.strokeStyle = '#7d3f22';
    ctx.lineWidth = 3 * s;
    ctx.stroke();
  }
}

function drawLeg(ctx, x, y, s, o, phase) {
  ellipse(ctx, x, y, 10 * s, 20 * s, o.bodyColor, { color: o.outlineColor, w: 2.4 * s });
  ellipse(ctx, x, y + 16 * s + phase, 12 * s, 7 * s, o.hoofColor, { color: o.outlineColor, w: 1.5 * s });
}

function drawBaseCow(ctx, x, y, scale, options) {
  const s = scale || 1;
  const o = Object.assign(defaultOptions(), options || {});
  const p = {
    bodyX: x + 62 * s,
    bodyY: y + 78 * s,
    headX: x + 118 * s,
    headY: y + 31 * s
  };

  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const squash = o.expression === 'hit' ? { x: 1.08, y: 0.92 } : o.expression === 'running' ? { x: 1 + Math.sin((o.time || 0) * 12) * 0.025, y: 1 - Math.sin((o.time || 0) * 12) * 0.018 } : { x: 1, y: 1 };
  ctx.translate(p.bodyX, p.bodyY + 12 * s);
  ctx.scale(squash.x, squash.y);
  ctx.translate(-p.bodyX, -(p.bodyY + 12 * s));

  if (o.expression === 'running') {
    for (let i = 0; i < 4; i++) {
      line(ctx, x - (5 + i * 25) * s, y + (55 + i * 11) * s, x - (35 + i * 29) * s, y + (57 + i * 11) * s, 'rgba(255,160,46,0.4)', 4 * s);
    }
  }
  if (o.expression === 'record' || o.expression === 'rage') {
    for (let i = 0; i < 5; i++) {
      star(ctx, p.headX + Math.cos(i * 1.3) * 78 * s, p.headY + Math.sin(i * 1.3) * 58 * s, 7 * s, '#fff0a2');
    }
  }

  if (o.extraDecorations) o.extraDecorations(ctx, p, s, 'behind', o);

  ellipse(ctx, p.bodyX + 8 * s, p.bodyY + 62 * s, 98 * s, 17 * s, 'rgba(92,74,61,0.16)');
  const wag = Math.sin((o.time || 0) * 5) * 8 * s;
  curve(ctx, p.bodyX - 88 * s, p.bodyY - 4 * s, p.bodyX - 122 * s, p.bodyY - 32 * s + wag, p.bodyX - 104 * s, p.bodyY - 50 * s + wag, o.outlineColor, 4 * s);
  ellipse(ctx, p.bodyX - 110 * s, p.bodyY - 53 * s, 9 * s, 7 * s, o.spotColor, { color: o.outlineColor, w: 1.5 * s });

  const legPhase = o.expression === 'running' ? Math.sin((o.time || 0) * 18) * 3 * s : 0;
  drawLeg(ctx, p.bodyX - 53 * s, p.bodyY + 43 * s, s, o, legPhase);
  drawLeg(ctx, p.bodyX - 17 * s, p.bodyY + 47 * s, s, o, -legPhase);
  drawLeg(ctx, p.bodyX + 26 * s, p.bodyY + 47 * s, s, o, -legPhase);
  drawLeg(ctx, p.bodyX + 61 * s, p.bodyY + 43 * s, s, o, legPhase);

  ellipse(ctx, p.bodyX, p.bodyY, 88 * s, 56 * s, verticalGradient(ctx, p.bodyX, p.bodyY, 56 * s, '#ffffff', o.bodyColor, translucent(o.spotColor, 0.08)), { color: o.outlineColor, w: 4 * s });
  ellipse(ctx, p.bodyX - 25 * s, p.bodyY - 23 * s, 46 * s, 18 * s, 'rgba(255,255,255,0.34)');
  ellipse(ctx, p.bodyX + 40 * s, p.bodyY + 31 * s, 32 * s, 9 * s, 'rgba(92,74,61,0.06)');
  drawSpots(ctx, o, p, s);

  if (o.extraDecorations) o.extraDecorations(ctx, p, s, 'body', o);

  ellipse(ctx, p.headX - 61 * s, p.headY - 2 * s, 24 * s, 15 * s, o.earColor, { color: o.outlineColor, w: 3 * s });
  ellipse(ctx, p.headX + 61 * s, p.headY - 2 * s, 24 * s, 15 * s, o.earColor, { color: o.outlineColor, w: 3 * s });
  ellipse(ctx, p.headX - 63 * s, p.headY - 2 * s, 12 * s, 7 * s, o.innerEarColor);
  ellipse(ctx, p.headX + 63 * s, p.headY - 2 * s, 12 * s, 7 * s, o.innerEarColor);
  ellipse(ctx, p.headX - 31 * s, p.headY - 46 * s, 14 * s, 19 * s, o.hornColor, { color: o.outlineColor, w: 3 * s });
  ellipse(ctx, p.headX + 31 * s, p.headY - 46 * s, 14 * s, 19 * s, o.hornColor, { color: o.outlineColor, w: 3 * s });

  ellipse(ctx, p.headX, p.headY, 58 * s, 52 * s, verticalGradient(ctx, p.headX, p.headY, 52 * s, '#ffffff', o.headColor || o.bodyColor, translucent(o.spotColor, 0.06)), { color: o.outlineColor, w: 4 * s });
  ellipse(ctx, p.headX - 18 * s, p.headY - 23 * s, 26 * s, 12 * s, 'rgba(255,255,255,0.36)');
  blob(ctx, [[p.headX - 49 * s, p.headY - 21 * s], [p.headX - 25 * s, p.headY - 38 * s], [p.headX - 4 * s, p.headY - 20 * s], [p.headX - 14 * s, p.headY + 0 * s], [p.headX - 42 * s, p.headY + 1 * s]], o.spotColor, { color: o.outlineColor, w: 1.6 * s });

  if (o.extraDecorations) o.extraDecorations(ctx, p, s, 'head', o);

  drawEyes(ctx, o, p, s);
  ellipse(ctx, p.headX - 41 * s, p.headY + 18 * s, 9 * s, 6 * s, o.blushColor);
  ellipse(ctx, p.headX + 42 * s, p.headY + 18 * s, 9 * s, 6 * s, o.blushColor);
  ellipse(ctx, p.headX, p.headY + 29 * s, 34 * s, 22 * s, verticalGradient(ctx, p.headX, p.headY + 29 * s, 22 * s, '#fff1df', o.muzzleColor, '#f4caa8'), { color: o.outlineColor, w: 3 * s });
  ellipse(ctx, p.headX - 9 * s, p.headY + 20 * s, 10 * s, 5 * s, 'rgba(255,255,255,0.24)');
  ellipse(ctx, p.headX - 10 * s, p.headY + 25 * s, 3.2 * s, 4.2 * s, '#57321f');
  ellipse(ctx, p.headX + 10 * s, p.headY + 25 * s, 3.2 * s, 4.2 * s, '#57321f');
  drawExpression(ctx, o, p, s);

  if (o.extraDecorations) o.extraDecorations(ctx, p, s, 'front', o);
  ctx.restore();
}

const skins = {
  normal: { bodyColor: '#fffdf4', headColor: '#fff8e9', spotColor: '#3f2a22' },
  strawberry: { bodyColor: '#fffdf4', headColor: '#fff7ea', spotColor: '#ff7f98', blushColor: '#ff8da8' },
  cloud: { bodyColor: '#f7fbff', headColor: '#ffffff', spotColor: '#9fd7ff', muzzleColor: '#ffe8d5' },
  pudding: { bodyColor: '#ffe7a6', headColor: '#fff0be', spotColor: '#b9702f', muzzleColor: '#ffe2bc' },
  star_pajama: { bodyColor: '#dce7ff', headColor: '#fff8e9', spotColor: '#6f8edc', muzzleColor: '#ffe7ca' },
  peach: { bodyColor: '#ffe3dc', headColor: '#fff2ea', spotColor: '#ff9f9b', muzzleColor: '#ffe0cf' },
  milk_tea: { bodyColor: '#d9ad7d', headColor: '#efcfaa', spotColor: '#6d452e', muzzleColor: '#f8dab8' },
  dino: { bodyColor: '#b7ec9b', headColor: '#fff8e9', spotColor: '#4ea86b', muzzleColor: '#ffe2c7' },
  raincoat: { bodyColor: '#ffe36c', headColor: '#fff8e9', spotColor: '#f5b83e', muzzleColor: '#ffe2c7' },
  panda: { bodyColor: '#fffdf4', headColor: '#fff8e9', spotColor: '#252525', muzzleColor: '#ffe2c7' },
  crown: { bodyColor: '#fffdf4', headColor: '#fff8e9', spotColor: '#d5a02d', hornColor: '#fff0a2' },
  rainbow: { bodyColor: '#fffdf4', headColor: '#fff8e9', spotColor: '#57c7ff' }
};

function skinDecor(skinId) {
  return function(ctx, p, s, layer, o) {
    if (skinId === 'strawberry' && layer === 'front') {
      ellipse(ctx, p.headX, p.headY - 58 * s, 16 * s, 13 * s, '#ff5f7f', { color: o.outlineColor, w: 2 * s });
      star(ctx, p.headX, p.headY - 69 * s, 6 * s, '#6fd66d');
    }
    if (skinId === 'cloud' && layer === 'body') {
      for (let i = 0; i < 5; i++) ellipse(ctx, p.bodyX - 62 * s + i * 28 * s, p.bodyY - 44 * s, 17 * s, 11 * s, '#ffffff', { color: '#b8dfff', w: 1.5 * s });
    }
    if (skinId === 'pudding' && layer === 'head') {
      ellipse(ctx, p.headX, p.headY - 36 * s, 30 * s, 9 * s, '#c77a2d');
    }
    if (skinId === 'star_pajama' && layer === 'body') {
      for (let i = 0; i < 5; i++) star(ctx, p.bodyX - 54 * s + i * 27 * s, p.bodyY - (10 + (i % 2) * 16) * s, 5 * s, '#fff4a2');
    }
    if (skinId === 'peach' && layer === 'front') {
      ellipse(ctx, p.headX + 23 * s, p.headY - 55 * s, 13 * s, 7 * s, '#75d67b', { color: o.outlineColor, w: 1.5 * s });
    }
    if (skinId === 'milk_tea' && layer === 'front') {
      line(ctx, p.headX + 29 * s, p.headY - 48 * s, p.headX + 42 * s, p.headY - 72 * s, '#ff7baa', 4 * s);
      for (let i = 0; i < 4; i++) ellipse(ctx, p.bodyX - 46 * s + i * 25 * s, p.bodyY + 22 * s, 5 * s, 5 * s, '#57321f');
    }
    if (skinId === 'dino' && layer === 'behind') {
      for (let i = 0; i < 5; i++) {
        blob(ctx, [[p.bodyX - 45 * s + i * 22 * s, p.bodyY - 66 * s], [p.bodyX - 34 * s + i * 22 * s, p.bodyY - 48 * s], [p.bodyX - 56 * s + i * 22 * s, p.bodyY - 48 * s]], '#62c96f', { color: o.outlineColor, w: 1.5 * s });
      }
    }
    if (skinId === 'raincoat' && layer === 'head') {
      roundRect(ctx, p.headX - 43 * s, p.headY - 57 * s, 86 * s, 21 * s, 11 * s, '#ffd83d', { color: o.outlineColor, w: 2 * s });
      line(ctx, p.headX - 33 * s, p.headY - 34 * s, p.headX + 34 * s, p.headY - 34 * s, '#f0bd2d', 3 * s);
    }
    if (skinId === 'panda' && layer === 'head') {
      ellipse(ctx, p.headX - 18 * s, p.headY - 3 * s, 18 * s, 16 * s, '#252525');
      ellipse(ctx, p.headX + 21 * s, p.headY - 3 * s, 18 * s, 16 * s, '#252525');
    }
    if (skinId === 'crown' && layer === 'front') {
      blob(ctx, [[p.headX - 22 * s, p.headY - 58 * s], [p.headX - 12 * s, p.headY - 76 * s], [p.headX, p.headY - 58 * s], [p.headX + 13 * s, p.headY - 76 * s], [p.headX + 24 * s, p.headY - 58 * s]], '#ffd438', { color: o.outlineColor, w: 2 * s });
      ellipse(ctx, p.headX, p.headY - 65 * s, 4 * s, 4 * s, '#fff6bd');
    }
    if (skinId === 'rainbow' && layer === 'body') {
      const cs = ['#ff6f8f', '#ffb02e', '#ffe45c', '#72dd73', '#57c7ff', '#b887ff'];
      for (let i = 0; i < cs.length; i++) ellipse(ctx, p.bodyX - 58 * s + i * 23 * s, p.bodyY - 18 * s + (i % 2) * 22 * s, 10 * s, 8 * s, cs[i], { color: o.outlineColor, w: 1 * s });
    }
  };
}

function stateOptions(state, t) {
  const expression = state === 'hit' ? 'hit' : state === 'sad' ? 'sad' : state === 'record' ? 'record' : state === 'rage' ? 'rage' : state === 'running' ? 'running' : state === 'charging' ? 'charging' : 'idle';
  return {
    expression,
    eyeStyle: expression === 'idle' && Math.sin((t || 0) * 2.5) > 0.92 ? 'blink' : 'normal',
    blushColor: expression === 'charging' ? '#ff7f8d' : '#ff9fb4',
    time: t || 0
  };
}

function buildOptions(skinId, state, t) {
  const id = skins[skinId] ? skinId : 'normal';
  return Object.assign({}, skins[id], stateOptions(state, t), { extraDecorations: skinDecor(id) });
}

module.exports = {
  drawBaseCow,
  drawCow(ctx, x, y, scale, skinId, state, t) {
    drawBaseCow(ctx, x, y, scale || 1, buildOptions(skinId, state, t));
  },
  drawCowPreview(ctx, x, y, scale, skinId, t) {
    const s = scale || 1;
    const id = skins[skinId] ? skinId : 'normal';
    ctx.save();
    ellipse(ctx, x, y + 64 * s, 95 * s, 18 * s, 'rgba(138,84,47,0.18)');
    ellipse(ctx, x, y + 3 * s, 104 * s, 92 * s, id === 'crown' ? 'rgba(255,216,56,0.28)' : id === 'rainbow' ? 'rgba(87,199,255,0.24)' : 'rgba(255,248,218,0.48)');
    drawBaseCow(ctx, x - 90 * s, y - 64 * s, 1.05 * s, buildOptions(id, id === 'panda' ? 'idle' : 'record', t));
    ctx.restore();
  }
};
