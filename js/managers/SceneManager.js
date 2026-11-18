class SceneManager {
  constructor(app) {
    this.app = app;
    this.factories = {};
    this.current = null;
    this.transition = 0;
  }
  register(name, factory) { this.factories[name] = factory; }
  change(name, data) {
    if (this.current && this.current.destroy) this.current.destroy();
    this.current = this.factories[name](data || {});
    this.transition = 180;
  }
  update(dt) {
    if (this.transition > 0) this.transition -= dt;
    if (this.current && this.current.update) this.current.update(dt);
  }
  draw(ctx, t) {
    if (this.current && this.current.draw) this.current.draw(ctx, t);
    if (this.transition > 0) {
      const a = Math.max(0, Math.min(1, this.transition / 180));
      ctx.save();
      ctx.globalAlpha = a * 0.55;
      ctx.fillStyle = '#FFF7EC';
      ctx.fillRect(0, 0, this.app.width, this.app.height);
      ctx.restore();
    }
  }
  touchStart(x, y) { return this.current && this.current.touchStart && this.current.touchStart(x, y); }
  touchMove(x, y) { return this.current && this.current.touchMove && this.current.touchMove(x, y); }
  touchEnd(x, y) { return this.current && this.current.touchEnd && this.current.touchEnd(x, y); }
}

module.exports = SceneManager;
