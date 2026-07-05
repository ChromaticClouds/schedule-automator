import { PlanningFlowGuide } from './planning-flow-guide';
import { PlanningGoalCreateSection } from './planning-goal-create-section';
import { PlanningProtectedCreateSection } from './planning-protected-create-section';
import { PlanningTaskSection } from './planning-task-section';

export function PlanningCreateSections() {
  return (
    <>
      <PlanningFlowGuide />
      <PlanningGoalCreateSection />
      <PlanningTaskSection />
      <PlanningProtectedCreateSection />
    </>
  );
}
