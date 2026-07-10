import { Drawer } from 'expo-router/drawer';
import { type ColorValue, useWindowDimensions, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';

const drawerLabel = (label: string, subtitle: string) =>
  function DrawerLabelRenderer({ color }: { color: ColorValue }) {
    return (
      <View className="gap-0.5">
        <Text className="text-sm font-semibold" style={{ color }}>
          {label}
        </Text>
        <Text className="text-xs" style={{ color, opacity: 0.72 }}>
          {subtitle}
        </Text>
      </View>
    );
  };

export default function AppDrawer() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(320, Math.max(280, width * 0.84));

  return (
    <Drawer
      screenOptions={({ navigation }) => ({
        drawerActiveBackgroundColor: theme.backgroundSelected,
        drawerActiveTintColor: theme.text,
        drawerInactiveTintColor: theme.textSecondary,
        drawerItemStyle: { borderRadius: 12, minHeight: 58 },
        drawerPosition: 'left',
        drawerStyle: { backgroundColor: theme.background, width: drawerWidth },
        drawerType: 'front',
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerLeft: () => (
          <Button
            accessibilityLabel="카테고리 메뉴 열기"
            className="ml-2 h-11 w-11 rounded-full"
            onPress={() => navigation.toggleDrawer()}
            size="icon"
            variant="ghost"
          >
            <View className="items-center gap-1">
              <View className="h-0.5 w-5 rounded-full bg-foreground" />
              <View className="h-0.5 w-5 rounded-full bg-foreground" />
              <View className="h-0.5 w-5 rounded-full bg-foreground" />
            </View>
          </Button>
        ),
        overlayColor: 'rgba(0,0,0,0.48)',
        sceneStyle: { backgroundColor: theme.background },
        swipeEnabled: true,
      })}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: drawerLabel('오늘 일정', 'AI와 대화하며 초안 만들기'),
          title: '오늘 일정',
        }}
      />
      <Drawer.Screen
        name="planning"
        options={{
          drawerLabel: drawerLabel('계획 관리', '목표·작업·보호 시간 관리'),
          title: '계획 관리',
        }}
      />
      <Drawer.Screen
        name="review"
        options={{
          drawerLabel: drawerLabel('오늘 회고', '완료 상태와 재배치 검토'),
          title: '오늘 회고',
        }}
      />
      <Drawer.Screen
        name="explore"
        options={{
          drawerLabel: drawerLabel('기능 탐색', '계획 흐름과 도구 확인'),
          title: '기능 탐색',
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          drawerLabel: drawerLabel('설정', '시간대와 작업량 조정'),
          title: '설정',
        }}
      />
    </Drawer>
  );
}
