class AdManager {
  init(app) { this.app = app; }
  showRewardedVideo(callback) {
    setTimeout(() => {
      if (this.app) this.app.toast.show('模拟广告播放完成，奖励已发放');
      callback && callback(true);
    }, 180);
  }
  showInterstitialAd() { if (this.app) this.app.toast.show('模拟插屏广告'); }
  showBannerAd() {}
  hideBannerAd() {}
}

module.exports = new AdManager();
