const SceneManager = require('./managers/SceneManager');
const PlayerData = require('./managers/PlayerDataManager');
const EnergyManager = require('./managers/EnergyManager');
const SkinManager = require('./managers/SkinManager');
const AdManager = require('./managers/AdManager');
const ShopManager = require('./managers/ShopManager');
const TaskManager = require('./managers/TaskManager');
const CloudManager = require('./managers/CloudManager');
const AudioManager = require('./managers/AudioManager');
const AssetManager = require('./managers/AssetManager');
const AssetConfig = require('./config/AssetConfig');
const Toast = require('./ui/Toast');
const Modal = require('./ui/Modal');

const HomeScene = require('./scenes/HomeScene');
const GameScene = require('./scenes/GameScene');
const ResultScene = require('./scenes/ResultScene');
const UpgradeScene = require('./scenes/UpgradeScene');
const SkinScene = require('./scenes/SkinScene');
const TaskScene = require('./scenes/TaskScene');
const RankScene = require('./scenes/RankScene');
const ShopScene = require('./scenes/ShopScene');

class Main {
  constructor(canvas, ctx) {
    const info = wx.getSystemInfoSync();
    canvas.width = info.windowWidth;
    canvas.height = info.windowHeight;
    this.canvas = canvas;
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;
    this.time = 0;
    this.last = Date.now();
    this.toast = new Toast();
    this.modal = new Modal(this);
    this.scene = new SceneManager(this);
    this.player = PlayerData;
    this.energy = EnergyManager;
    this.skins = SkinManager;
    this.ad = AdManager;
    this.shop = ShopManager;
    this.tasks = TaskManager;
    this.cloud = CloudManager;
    this.audio = AudioManager;
    this.assets = AssetManager;
  }

  start() {
    this.player.init();
    this.ad.init(this);
    this.energy.init(this);
    this.skins.init(this);
    this.tasks.init(this);
    this.shop.init(this);
    this.cloud.init(this);
    this.audio.init(this);
    this.assets.init(AssetConfig, (done, total) => {
      this.assetProgress = total ? done / total : 1;
    }).then(() => {
      this.registerScenes();
      this.bindTouch();
      this.scene.change('Home');
      this.loop();
      const errors = this.assets.getLoadErrors();
      if (errors.length) this.toast.show('部分素材加载失败，已启用绘制兜底');
    });
  }

  registerScenes() {
    this.scene.register('Home', data => new HomeScene(this, data));
    this.scene.register('Game', data => new GameScene(this, data));
    this.scene.register('Result', data => new ResultScene(this, data));
    this.scene.register('Upgrade', data => new UpgradeScene(this, data));
    this.scene.register('Skin', data => new SkinScene(this, data));
    this.scene.register('Task', data => new TaskScene(this, data));
    this.scene.register('Rank', data => new RankScene(this, data));
    this.scene.register('Shop', data => new ShopScene(this, data));
  }

  bindTouch() {
    const point = e => ({ x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY });
    wx.onTouchStart(e => {
      const p = point(e);
      if (this.modal.visible) this.modal.touchStart(p.x, p.y);
      else this.scene.touchStart(p.x, p.y);
    });
    wx.onTouchMove(e => {
      const p = point(e);
      if (!this.modal.visible) this.scene.touchMove(p.x, p.y);
    });
    wx.onTouchEnd(e => {
      const p = point(e);
      if (this.modal.visible) this.modal.touchEnd(p.x, p.y);
      else this.scene.touchEnd(p.x, p.y);
    });
  }

  showEnergyModal() {
    const count = this.energy.getTodayAdEnergyCount();
    const adFull = count >= 5;
    this.modal.show({
      title: '体力不足',
      message: '当前体力：' + this.energy.getEnergy() + '/' + this.energy.getMaxEnergy() + '\n小牛累趴啦，看个广告让它继续冲！',
      cowState: 'sad',
      skinId: 'normal',
      buttons: [
        { text: adFull ? '今日广告恢复次数已用完' : '看广告获得 5 点体力', color: '#ffb02e', disabled: adFull, onTap: () => this.energy.watchAdForEnergy() },
        { text: '使用体力券（' + this.energy.getEnergyTicketCount() + '）', color: '#72dd73', disabled: this.energy.getEnergyTicketCount() <= 0, onTap: () => {
          if (this.energy.useEnergyTicket()) this.toast.show('体力 +1');
          else this.toast.show('没有体力券');
        }},
        { text: '购买体力礼包', color: '#ff8bb3', onTap: () => this.scene.change('Shop') },
        { text: this.energy.getNextRecoverTimeText(), color: '#ffcf65', close: false },
        { text: '关闭', color: '#b8d998' }
      ]
    });
  }

  loop() {
    const now = Date.now();
    const dt = Math.min(50, now - this.last);
    this.last = now;
    this.time += dt / 1000;
    this.energy.refreshEnergy();
    this.scene.update(dt);
    this.modal.update(dt);
    this.toast.update(dt);
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.scene.draw(this.ctx, this.time);
    this.modal.draw(this.ctx, this.time);
    this.toast.draw(this.ctx, this.width, this.height);
    const raf = (typeof requestAnimationFrame !== 'undefined') ? requestAnimationFrame : (fn) => setTimeout(fn, 16);
    raf(() => this.loop());
  }
}

module.exports = Main;
