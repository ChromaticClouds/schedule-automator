const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');
const { withNativeWind } = require('nativewind/metro');
const {
  withStorybook,
} = require('@storybook/react-native/metro/withStorybook');

const config = getDefaultConfig(__dirname);

const nativeWindConfig = withNativeWind(config, {
  input: path.join(__dirname, 'src/global.css'),
  inlineRem: 16,
});

module.exports = withStorybook(nativeWindConfig, {
  enabled: process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true',
});
