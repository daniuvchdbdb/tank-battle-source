const mem = {};

function hasWx() {
  return typeof wx !== 'undefined' && wx.getStorageSync && wx.setStorageSync;
}

module.exports = {
  get(key, fallback) {
    try {
      const value = hasWx() ? wx.getStorageSync(key) : mem[key];
      return value === '' || value === undefined || value === null ? fallback : value;
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      if (hasWx()) wx.setStorageSync(key, value);
      else mem[key] = value;
    } catch (e) {}
  }
};
