import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { useToast } from '@/components/toast-provider';
import { planningErrorMessage } from './api-feedback';
import { useCreateProtectedTime, useProtectedTimes } from './hooks';
import { PlanningSection } from './planning-section';
import { sectionState } from './planning-section-state';
import { ProtectedTimeCreateRow } from './protected-time-create-row';

export function PlanningProtectedCreateSection() {
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('12:00');
  const [end, setEnd] = useState('13:00');
  const protectedTimes = useProtectedTimes();
  const createProtectedTime = useCreateProtectedTime();
  const submitProtected = () => {
    if (!title.trim()) return;
    createProtectedTime.mutate(
      {
        category: 'custom',
        daysOfWeek: [1, 2, 3, 4, 5],
        endTime: end,
        protectionLevel: 'hard',
        startTime: start,
        title: title.trim(),
      },
      {
        onError: (error) =>
          showToast({
            kind: 'error',
            message: planningErrorMessage(error, '보호 시간을 저장하지 못했습니다.'),
          }),
        onSuccess: () => {
          setTitle('');
          showToast({ kind: 'success', message: '보호 시간을 추가했습니다.' });
        },
      },
    );
  };

  return (
    <PlanningSection {...sectionState('보호 시간', protectedTimes)}>
      <ProtectedTimeCreateRow
        endTime={end}
        errorMessage={
          createProtectedTime.error
            ? planningErrorMessage(
                createProtectedTime.error,
                '보호 시간을 저장하지 못했습니다.',
              )
            : undefined
        }
        isPending={createProtectedTime.isPending}
        onChangeEnd={(value) => {
          createProtectedTime.reset();
          setEnd(value);
        }}
        onChangeStart={(value) => {
          createProtectedTime.reset();
          setStart(value);
        }}
        onChangeTitle={(value) => {
          createProtectedTime.reset();
          setTitle(value);
        }}
        onSubmit={submitProtected}
        startTime={start}
        title={title}
      />
      {protectedTimes.data?.map((block) => (
        <ThemedText key={block._id} type="small">
          {`${block.title} ${block.startTime}-${block.endTime}`}
        </ThemedText>
      ))}
    </PlanningSection>
  );
}
