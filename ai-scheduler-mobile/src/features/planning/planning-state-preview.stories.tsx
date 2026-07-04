import type { Meta, StoryObj } from '@storybook/react-native';

import { PlanningStatePreview } from './planning-state-preview';

const meta = {
  title: 'Planning/State Preview',
  component: PlanningStatePreview,
  parameters: {
    notes:
      'Renders the fixture-backed planning state catalog used by the in-app preview route.',
  },
} satisfies Meta<typeof PlanningStatePreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Catalog: Story = {};
