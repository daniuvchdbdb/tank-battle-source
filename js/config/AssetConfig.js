const states = ['idle', 'charging', 'running', 'hit', 'sad', 'record'];
const pngSkins = ['normal', 'wronged', 'golden', 'rocket', 'poop_helmet', 'love'];

const assets = [
  { key: 'ui.button.orange', path: 'assets/ui/button_orange.png', type: 'ui' },
  { key: 'ui.button.green', path: 'assets/ui/button_green.png', type: 'ui' },
  { key: 'ui.button.pink', path: 'assets/ui/button_pink.png', type: 'ui' },
  { key: 'ui.card', path: 'assets/ui/card.png', type: 'ui' },
  { key: 'ui.modal', path: 'assets/ui/modal.png', type: 'ui' },
  { key: 'ui.icon.coin', path: 'assets/ui/icon_coin.png', type: 'ui' },
  { key: 'ui.icon.energy', path: 'assets/ui/icon_energy.png', type: 'ui' },
  { key: 'ui.icon.task', path: 'assets/ui/icon_task.png', type: 'ui' },
  { key: 'ui.icon.skin', path: 'assets/ui/icon_skin.png', type: 'ui' },
  { key: 'ui.icon.shop', path: 'assets/ui/icon_shop.png', type: 'ui' },
  { key: 'ui.icon.rank', path: 'assets/ui/icon_rank.png', type: 'ui' },
  { key: 'ui.icon.upgrade', path: 'assets/ui/icon_upgrade.png', type: 'ui' },
  { key: 'effect.star', path: 'assets/effects/star.png', type: 'effect' },
  { key: 'effect.heart', path: 'assets/effects/heart.png', type: 'effect' },
  { key: 'effect.sparkle', path: 'assets/effects/sparkle.png', type: 'effect' },
  { key: 'effect.fire', path: 'assets/effects/fire.png', type: 'effect' },
  { key: 'effect.coin', path: 'assets/effects/coin.png', type: 'effect' }
];

pngSkins.forEach((skin) => {
  states.forEach((state) => {
    assets.push({ key: 'cow.' + skin + '.' + state, path: 'assets/cows/' + skin + '_' + state + '.png', type: 'cow' });
  });
  assets.push({ key: 'cow.' + skin + '.preview', path: 'assets/cows/' + skin + '_preview.png', type: 'cow' });
});

module.exports = assets;
