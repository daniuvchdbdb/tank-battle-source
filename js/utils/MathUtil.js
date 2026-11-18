module.exports = {
  clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  },
  rand(min, max) {
    return min + Math.random() * (max - min);
  },
  randInt(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
  },
  choose(list) {
    return list[Math.floor(Math.random() * list.length)];
  },
  hit(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }
};
