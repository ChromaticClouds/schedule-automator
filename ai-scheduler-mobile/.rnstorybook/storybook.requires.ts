/* do not change this file manually after running Storybook generation. */

import { start, updateView } from '@storybook/react-native';

import '@storybook/addon-ondevice-controls/register';
import '@storybook/addon-ondevice-actions/register';
import '@storybook/addon-ondevice-backgrounds/register';

const normalizedStories = [
  {
    titlePrefix: '',
    directory: '../src/features',
    files: '**/*.stories.?(ts|tsx|js|jsx)',
    importPathMatcher: /^\.\/.*\.stories\.(ts|tsx|js|jsx)$/,
    // @ts-ignore require.context is provided by Metro.
    req: require.context(
      '../src/features',
      true,
      /^\.\/.*\.stories\.(ts|tsx|js|jsx)$/,
    ),
  },
];

declare global {
  var view: ReturnType<typeof start>;
  var STORIES: typeof normalizedStories;
}

const annotations = [
  require('./preview'),
  require('@storybook/react-native/dist/preview'),
  require('@storybook/addon-ondevice-actions/preview'),
  require('@storybook/addon-ondevice-backgrounds/preview'),
];

global.STORIES = normalizedStories;

// @ts-ignore Metro hot module replacement is optional here.
module?.hot?.accept?.();

if (!global.view) {
  global.view = start({ annotations, storyEntries: normalizedStories });
} else {
  updateView(global.view, annotations, normalizedStories);
}

export const view = global.view;
