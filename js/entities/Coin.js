const Particle = require('./Particle');

class Coin extends Particle {
  constructor(x, y, target) {
    super({ x, y, vx: Math.random() * 4 - 2, vy: -5, life: 900, size: 8, type: 'coin', target });
  }
}

module.exports = Coin;
