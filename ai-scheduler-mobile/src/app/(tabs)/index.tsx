import { TabScreenFrame } from '@/components/tab-screen';
import { PlanningDashboard } from '@/features/planning/planning-dashboard';

export default function HomeScreen() {
  return (
    <TabScreenFrame>
      <PlanningDashboard />
    </TabScreenFrame>
  );
}
