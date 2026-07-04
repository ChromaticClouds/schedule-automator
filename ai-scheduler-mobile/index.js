if (process.env.STORYBOOK_ENABLED === 'true') {
  const { registerRootComponent } = require('expo');
  const StorybookUIRoot = require('./.rnstorybook').default;

  registerRootComponent(StorybookUIRoot);
} else {
  require('expo-router/entry');
}
