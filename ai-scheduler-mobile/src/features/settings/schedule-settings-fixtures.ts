import {
  validScheduleSettingsForm,
} from './schedule-settings-panel';
import type { SchedulePreferencesForm } from './types';

export const validScheduleSettings: SchedulePreferencesForm = {
  maxDailyWorkMinutes: '480',
  timezone: 'Asia/Seoul',
  wakeOffsetMinutes: '10',
  wakeTime: '07:00',
};

export const scheduleSettingsFixtures = {
  errorMessage: '설정을 저장하지 못했습니다.',
  invalidMinutes: {
    ...validScheduleSettings,
    maxDailyWorkMinutes: '30',
  },
  invalidOffset: {
    ...validScheduleSettings,
    wakeOffsetMinutes: '241',
  },
  invalidOffsetEmpty: {
    ...validScheduleSettings,
    wakeOffsetMinutes: '',
  },
  invalidTime: {
    ...validScheduleSettings,
    wakeTime: '24:00',
  },
  loading: true,
  saving: true,
  success: true,
  valid: validScheduleSettingsForm(validScheduleSettings),
};
