import { useState } from 'react';

import { useToast } from '@/components/toast-provider';
import { planningErrorMessage } from './api-feedback';
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask,
} from './hooks';
import { PlanningSection } from './planning-section';
import { sectionState } from './planning-section-state';
import { PlanningTaskCreateRow } from './planning-task-create-row';
import { TaskManageItem } from './task-manage-item';

const defaultTaskMinutes = '60';

export function PlanningTaskSection() {
  const { showToast } = useToast();
  const [taskTitle, setTaskTitle] = useState('');
  const [taskMinutes, setTaskMinutes] = useState(defaultTaskMinutes);
  const tasks = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const toastError = (error: unknown, fallback: string) =>
    showToast({ kind: 'error', message: planningErrorMessage(error, fallback) });

  const submitTask = (estimatedMinutes: number) => {
    createTask.mutate(
      {
        energyLevel: 'medium',
        estimatedMinutes,
        goalImpact: 3,
        importance: 3,
        title: taskTitle.trim(),
      },
      {
        onError: (error) => toastError(error, '작업을 저장하지 못했습니다.'),
        onSuccess: () => {
          setTaskTitle('');
          setTaskMinutes(defaultTaskMinutes);
          showToast({ kind: 'success', message: '작업을 추가했습니다.' });
        },
      },
    );
  };

  return (
    <PlanningSection {...sectionState('작업', tasks)}>
      <PlanningTaskCreateRow
        errorMessage={
          createTask.error
            ? planningErrorMessage(createTask.error, '작업을 저장하지 못했습니다.')
            : undefined
        }
        isPending={createTask.isPending}
        minutes={taskMinutes}
        onChangeMinutes={(value) => {
          createTask.reset();
          setTaskMinutes(value);
        }}
        onChangeTitle={(value) => {
          createTask.reset();
          setTaskTitle(value);
        }}
        onSubmit={submitTask}
        title={taskTitle}
      />
      {tasks.data?.map((task) => (
        <TaskManageItem
          isDeleting={deleteTask.isPending && deleteTask.variables === task._id}
          isUpdating={updateTask.isPending && updateTask.variables?.id === task._id}
          key={task._id}
          onDelete={() =>
            deleteTask.mutate(task._id, {
              onError: (error) => toastError(error, '작업을 삭제하지 못했습니다.'),
              onSuccess: () =>
                showToast({ kind: 'success', message: '작업을 삭제했습니다.' }),
            })
          }
          onUpdate={(title, estimatedMinutes) =>
            updateTask.mutate(
              { estimatedMinutes, id: task._id, title },
              {
                onError: (error) => toastError(error, '작업을 수정하지 못했습니다.'),
                onSuccess: () =>
                  showToast({ kind: 'success', message: '작업을 수정했습니다.' }),
              },
            )
          }
          task={task}
        />
      ))}
    </PlanningSection>
  );
}
