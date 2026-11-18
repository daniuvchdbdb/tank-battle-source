class GrowthManager {
  constructor() {
    this.reset();
  }

  reset() {
    this.level = 1;
    this.xp = 0;
    this.nextXp = 36;
    this.extraSize = 0;
    this.pendingLevels = 0;
  }

  addExp(amount, bonusRate) {
    const gain = Math.max(1, Math.floor(amount * (1 + (bonusRate || 0))));
    this.xp += gain;
    let leveled = 0;
    while (this.xp >= this.nextXp) {
      this.xp -= this.nextXp;
      this.level += 1;
      leveled += 1;
      this.nextXp = Math.floor(34 + this.level * 22 + Math.pow(this.level, 1.35) * 8);
    }
    this.pendingLevels += leveled;
    return leveled;
  }

  consumeLevelUp() {
    if (this.pendingLevels <= 0) return false;
    this.pendingLevels -= 1;
    return true;
  }

  addSize(value) {
    this.extraSize += value || 0;
  }

  getSize() {
    return 36 + this.level * 4.5 + this.extraSize;
  }

  getImpactPower() {
    return this.getSize() + this.level * 2;
  }

  getXpProgress() {
    return Math.max(0, Math.min(1, this.xp / this.nextXp));
  }

  getCoinRate() {
    return 1 + (this.level - 1) * 0.04;
  }
}

module.exports = GrowthManager;
