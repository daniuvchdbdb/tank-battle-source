const ShopConfig = require('../config/ShopConfig');
const PlayerData = require('./PlayerDataManager');

class ShopManager {
  init(app) { this.app = app; }
  getProducts() { return ShopConfig; }
  getProduct(id) { return ShopConfig.find(p => p.productId === id); }
  purchaseProduct(productId) {
    const product = this.getProduct(productId);
    if (!product) return;
    this.app.modal.show({
      title: product.name,
      message: product.desc + '\n支付功能暂未接入，当前为测试模式。',
      cowState: 'record',
      skinId: product.rewards.trialSkin || 'normal',
      buttons: [
        { text: '确认模拟购买', color: '#ffb02e', onTap: () => this.grant(product) },
        { text: '再看看', color: '#72dd73' }
      ]
    });
  }
  grant(product) {
    const r = product.rewards || {};
    if (r.energy) this.app.energy.addEnergy(r.energy, true);
    if (r.maxEnergy) this.app.energy.setMaxEnergy(r.maxEnergy);
    if (r.coins) PlayerData.addCoins(r.coins);
    if (r.trialSkin) this.app.skins.addTrial(r.trialSkin, 5);
    if (r.monthlyCard) PlayerData.setFlag('monthlyCard', { active: true, lastClaimDate: '' });
    if (r.noAds) PlayerData.setFlag('noAds', true);
    if (r.battlePass) PlayerData.setFlag('battlePass', true);
    this.app.toast.show('测试奖励已发放');
  }
}

module.exports = new ShopManager();
