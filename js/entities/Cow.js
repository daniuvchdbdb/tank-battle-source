const CowSkinRenderer = require('../renderers/CowSkinRenderer');

class Cow {
  constructor(app) {
    this.app = app;
    this.x = app.width * 0.22;
    this.groundY = app.height * 0.68;
    this.y = this.groundY;
    this.state = 'idle';
    this.jump = 0;
    this.hitTimer = 0;
  }
  setState(s) { this.state = s; }
  bounce(power) { this.jump = Math.max(this.jump, power || 28); }
  update(dt) {
    if (this.jump > 0.1) {
      this.y -= this.jump * dt / 16.67;
      this.jump -= 1.25 * dt / 16.67;
    } else if (this.y < this.groundY) {
      this.y += 9 * dt / 16.67;
      if (this.y > this.groundY) this.y = this.groundY;
    }
    if (this.hitTimer > 0) this.hitTimer -= dt;
  }
  getBounds() { return { x: this.x + 10, y: this.y - 42, w: 112, h: 92 }; }
  draw(ctx, t) {
    const state = this.hitTimer > 0 ? 'hit' : this.state;
    CowSkinRenderer.drawCow(ctx, this.x, this.y - 74, 0.92, this.app.skins.getCurrentSkin(), state, t);
  }
}

module.exports = Cow;
