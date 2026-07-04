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
  wakeOffsetMinutes: '',
  wakeTime: '',
};

export const validScheduleSettingsForm = (form: SchedulePreferencesForm) => {
  const minutes = Number(form.maxDailyWorkMinutes);
  const offset = Number(form.wakeOffsetMinutes);
  return (
    /^([01]\d|2[0-3]):[0-5]\d$/.test(form.wakeTime) &&
    form.timezone.trim().length > 0 &&
    form.wakeOffsetMinutes.trim().length > 0 &&
    Number.isInteger(minutes) &&
    minutes >= 60 &&
    minutes <= 720 &&
    Number.isInteger(offset) &&
    offset >= 0 &&
    offset <= 240
  );
};

export function ScheduleSettingsPanel() {
  const query = useSchedulePreferences();
  const update = useUpdateSchedulePreferences();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!query.data) return;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setForm({
        maxDailyWorkMinutes: String(query.data.maxDailyWorkMinutes),
        timezone: query.data.timezone,
        wakeOffsetMinutes: String(query.data.wakeOffsetMinutes),
        wakeTime: query.data.wakeTime,
      });
    });
    return () => {
      active = false;
    };
  }, [query.data]);

  const change = (field: keyof SchedulePreferencesForm, value: string) => {
    update.reset();
    setForm((current) => ({ ...current, [field]: value }));
  };
  const save = () => update.mutate({
    maxDailyWorkMinutes: Number(form.maxDailyWorkMinutes),
    timezone: form.timezone.trim(),
    wakeOffsetMinutes: Number(form.wakeOffsetMinutes),
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
