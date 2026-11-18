class AssetManager {
  constructor() {
    this.images = {};
    this.errors = [];
    this.loaded = false;
    this.total = 0;
    this.done = 0;
  }

  init(assetManifest, onProgress) {
    this.images = {};
    this.errors = [];
    this.total = assetManifest.length;
    this.done = 0;
    if (!this.total) {
      this.loaded = true;
      return Promise.resolve();
    }
    const createImage = () => {
      if (typeof wx !== 'undefined' && wx.createImage) return wx.createImage();
      if (typeof Image !== 'undefined') return new Image();
      return null;
    };
    return Promise.all(assetManifest.map((asset) => new Promise((resolve) => {
      const img = createImage();
      if (!img) {
        this.errors.push(asset.key);
        this.done++;
        if (onProgress) onProgress(this.done, this.total, asset);
        resolve();
        return;
      }
      img.onload = () => {
        this.images[asset.key] = img;
        this.done++;
        if (onProgress) onProgress(this.done, this.total, asset);
        resolve();
      };
      img.onerror = () => {
        this.errors.push(asset.key);
        this.done++;
        if (onProgress) onProgress(this.done, this.total, asset);
        resolve();
      };
      img.src = asset.path;
    }))).then(() => {
      this.loaded = true;
    });
  }

  getImage(key) {
    return this.images[key] || null;
  }

  isReady(key) {
    return !!this.images[key];
  }

  getLoadErrors() {
    return this.errors.slice();
  }
}

module.exports = new AssetManager();
