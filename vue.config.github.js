module.exports = {
  outputDir: "docs",
  publicPath: "/genpo_simulator/",
  pages: {
    index: {
      entry: "src/main.js",
      title: "元宝シミュレータ",
    },
  },
  transpileDependencies: ["vuetify"],
};
