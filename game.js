const Main = require('./js/main');

const canvas = wx.createCanvas();
const ctx = canvas.getContext('2d');

new Main(canvas, ctx).start();
