const colors = {
  cream: '#FFF7EC',
  cream2: '#FFF2D6',
  cream3: '#FFFDF6',
  peach: '#FFD9DF',
  yellow: '#FFE7A8',
  grass: '#D8F3C7',
  grass2: '#AEE889',
  grass3: '#74C96D',
  sky: '#CDEBFF',
  sky2: '#EAF8FF',
  tea: '#CFAE87',
  lavender: '#DED6FF',
  caramel: '#A8744F',
  coffee: '#5C4A3D',
  white: '#FFFDF8',
  orange: '#FFB84D',
  orange2: '#FFD978',
  orange3: '#E98E36',
  pink: '#FF9DB7',
  pink2: '#FFD4DF',
  green: '#8EE27B',
  green2: '#C7F2A9',
  blue: '#8BD7FF',
  purple: '#BCA8FF',
  shadow: 'rgba(92, 74, 61, 0.18)',
  shadowStrong: 'rgba(92, 74, 61, 0.28)'
};

module.exports = {
  colors,
  button: {
    primary: colors.orange,
    secondary: colors.green,
    reward: colors.pink,
    quiet: colors.yellow
  },
  rarity: {
    '普通': colors.green,
    '稀有': colors.blue,
    '史诗': colors.purple,
    '搞怪': colors.tea,
    '传说': '#FFD64A',
    '限定': colors.pink
  }
};
