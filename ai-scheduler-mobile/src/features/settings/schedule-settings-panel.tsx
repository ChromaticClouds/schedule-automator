import { useEffect, useState } from 'react';
import {
  useSchedulePreferences,
  useUpdateSchedulePreferences,
} from './hooks';
import { ScheduleSettingsView } from './schedule-settings-view';
import type { SchedulePreferencesForm } from './types';

const emptyForm: SchedulePreferencesForm = {
  maxDailyWorkMinutes: '',
  timezone: '',
  wakeTime: '',
};

export const validScheduleSettingsForm = (form: SchedulePreferencesForm) => {
  const minutes = Number(form.maxDailyWorkMinutes);
  return (
    /^([01]\d|2[0-3]):[0-5]\d$/.test(form.wakeTime) &&
    form.timezone.trim().length > 0 &&
    Number.isInteger(minutes) &&
    minutes >= 60 &&
    minutes <= 720
  );
};

export function ScheduleSettingsPanel() {
  const query = useSchedulePreferences();
  const update = useUpdateSchedulePreferences();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!query.data) return;
    setForm({
      maxDailyWorkMinutes: String(query.data.maxDailyWorkMinutes),
      timezone: query.data.timezone,
      wakeTime: query.data.wakeTime,
    });
  }, [query.data]);

  const change = (field: keyof SchedulePreferencesForm, value: string) => {
    update.reset();
    setForm((current) => ({ ...current, [field]: value }));
  };
  const save = () => update.mutate({
    maxDailyWorkMinutes: Number(form.maxDailyWorkMinutes),
    timezone: form.timezone.trim(),
    wakeTime: form.wakeTime,
  });

  return (
    <ScheduleSettingsView
      errorMessage={(query.error ?? update.error)?.message}
      form={form}
      isLoading={query.isLoading}
      isSaving={update.isPending}
      isSuccess={update.isSuccess}
      onChange={change}
      onSave={save}
      valid={validScheduleSettingsForm(form)}
    />
  );
}
