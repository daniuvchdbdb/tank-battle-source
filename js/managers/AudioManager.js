class AudioManager {
  init(app) { this.app = app; }
  vibrate() {
    try { if (typeof wx !== 'undefined' && wx.vibrateShort) wx.vibrateShort({ type: 'light' }); } catch (e) {}
  }
  hit() { this.vibrate(); }
  coin() {}
  record() { this.vibrate(); }
}

module.exports = new AudioManager();
