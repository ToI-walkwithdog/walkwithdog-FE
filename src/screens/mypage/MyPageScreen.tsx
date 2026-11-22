import { useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../../components/Icon";
import { Screen } from "../../components/Screen";
import { useMockSession } from "../../context/MockSession";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

export default function MyPageScreen() {
  const router = useRouter();
  const { profile, records, resetSession } = useMockSession();
  const distance = records.reduce((sum, record) => sum + record.distanceMeters, 0) / 1000;

  const menuItems = [
    { label: "내 정보 수정", detail: "닉네임 · 프로필 사진 · 전화번호", icon: "icon-user" as const, route: "/10-2" },
    { label: "산책 선호 설정", detail: "산책 지역 · 강아지 크기", icon: "icon-tune" as const, route: "/10-3" },
  ];

  return (
    <Screen
      backgroundColor={colors.white}
      contentContainerStyle={styles.scrollContent}
      scroll
      safeAreaEdges={[]}
      testID="screen-10-1"
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>마이페이지</Text>
        <Pressable
          accessibilityLabel="설정"
          accessibilityRole="button"
          onPress={() => router.push("/settings")}
          style={styles.settingsButton}
        >
          <Icon name="icon-settings" size={24} width={24} height={24} color={colors.brown} />
        </Pressable>
      </View>
      <View style={styles.profileCard}>
        <Text style={styles.profileName}>{profile.nickname} 님</Text>
        <View style={styles.levelBadge}>
          <Icon name="icon-shield" size={16} width={16} height={16} color={colors.brown2} />
          <Text style={styles.levelText}>산책 레벨 3</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{records.length}회</Text>
            <Text style={styles.statLabel}>총 산책</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{distance.toFixed(1)} km</Text>
            <Text style={styles.statLabel}>총 거리</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{new Set(records.map((record) => record.dogId)).size}마리</Text>
            <Text style={styles.statLabel}>함께한 강아지</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>내 정보</Text>
      {menuItems.map((item) => (
        <Pressable
          accessibilityLabel={item.label}
          accessibilityRole="button"
          key={item.label}
          onPress={() => router.push(item.route)}
          style={styles.menuItem}
        >
          <View style={styles.menuIcon}>
            <Icon name={item.icon} size={24} width={24} height={24} color={colors.brown} />
          </View>
          <View style={styles.menuText}>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuDetail}>{item.detail}</Text>
          </View>
          <Icon name="vector-next" size={24} width={6.9} height={11.84} color={colors.brown2} />
        </Pressable>
      ))}

      <Text style={styles.sectionTitle}>나의 산책</Text>
      <Pressable
        accessibilityLabel="산책 기록"
        accessibilityRole="button"
        onPress={() => router.push("/9-1")}
        style={styles.menuItem}
      >
        <View style={styles.menuIcon}>
          <Icon name="icon-schedule" size={24} width={24} height={24} color={colors.brown} />
        </View>
        <Text style={styles.menuLabelOnly}>산책 기록</Text>
        <Icon name="vector-next" size={24} width={6.9} height={11.84} color={colors.brown2} />
      </Pressable>
      <Pressable
        accessibilityLabel="예약 내역"
        accessibilityRole="button"
        onPress={() => router.push("/8-1")}
        style={styles.menuItem}
      >
        <View style={styles.menuIcon}>
          <Icon name="icon-calendar" size={24} width={24} height={24} color={colors.brown} />
        </View>
        <Text style={styles.menuLabelOnly}>예약 내역</Text>
        <Icon name="vector-next" size={24} width={6.9} height={11.84} color={colors.brown2} />
      </Pressable>

      <Pressable
        accessibilityLabel="로그아웃"
        accessibilityRole="button"
        onPress={() => Alert.alert("로그아웃", "앱에 임시 저장된 목업 데이터가 초기화돼요.", [
          { text: "취소", style: "cancel" },
          { text: "로그아웃", onPress: () => {
            resetSession();
            router.dismissAll();
            router.replace("/1-2");
          } },
        ])}
        style={styles.logoutButton}
      >
        <Text style={styles.logoutText}>로그아웃</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 24 },
  header: {
    alignSelf: "center",
    height: 82,
    paddingHorizontal: 20,
    paddingTop: 20,
    width: 375,
  },
  headerTitle: {
    color: colors.brown2,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 18,
  },
  settingsButton: {
    alignItems: "center",
    backgroundColor: colors.cream,
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    position: "absolute",
    right: 20,
    top: 20,
    width: 50,
  },
  profileCard: {
    alignSelf: "center",
    height: 150,
    paddingHorizontal: 20,
    width: 375,
  },
  profileName: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 30,
  },
  levelBadge: {
    alignItems: "center",
    backgroundColor: colors.cream,
    borderRadius: 25,
    flexDirection: "row",
    height: 30,
    paddingHorizontal: 8,
    position: "absolute",
    right: 20,
    top: 8,
  },
  levelText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 12,
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: "row",
    height: 70,
    marginTop: 18,
  },
  stat: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 18,
  },
  statLabel: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 12,
  },
  sectionTitle: {
    alignSelf: "center",
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 18,
    marginBottom: 8,
    width: 335,
  },
  menuItem: {
    alignSelf: "center",
    alignItems: "center",
    borderBottomColor: "#F0E8DC",
    borderBottomWidth: 1,
    flexDirection: "row",
    height: 72,
    width: 335,
  },
  menuIcon: {
    alignItems: "center",
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  menuText: {
    flex: 1,
    marginLeft: 12,
  },
  menuLabel: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 16,
  },
  menuDetail: {
    color: colors.brown2,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 12,
  },
  menuLabelOnly: {
    color: colors.brown,
    flex: 1,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 16,
    marginLeft: 12,
  },
  logoutButton: {
    alignSelf: "center",
    alignItems: "center",
    marginTop: 24,
  },
  logoutText: {
    color: colors.mildBrown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 16,
  },
});
