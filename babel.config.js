module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    //cSpell:ignore nativewind
    plugins: ["nativewind/babel"],
  };
};
