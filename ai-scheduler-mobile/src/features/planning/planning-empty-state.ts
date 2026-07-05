export const planningSectionEmptyMessages = {
  목표: '집중할 주간 목표를 추가하면 AI 작업 분해를 실행할 수 있습니다.',
  '보호 시간': '수면, 식사, 운동, 이동처럼 건드리면 안 되는 시간을 추가하세요.',
  작업: '아직 작업이 없습니다. 직접 추가하거나 목표를 AI로 분해하세요.',
} as const;

export const planningSectionErrorMessages = {
  목표: '목표를 불러오지 못했습니다. 연결 상태를 확인한 뒤 다시 시도하세요.',
  '보호 시간': '보호 시간을 불러오지 못했습니다. 잠시 후 다시 시도하세요.',
  작업: '작업을 불러오지 못했습니다. 일정을 짜기 전에 다시 시도하세요.',
} as const;

export type PlanningSectionTitle = keyof typeof planningSectionEmptyMessages;
