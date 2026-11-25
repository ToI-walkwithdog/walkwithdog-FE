import type { ReactNode } from "react";
import { useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { Icon, type IconName } from "../../components/Icon";
import { Screen } from "../../components/Screen";
import { GradientView } from "../../components/GradientView";
import { useMockSession } from "../../context/MockSession";
import { gradientMyPageBadge, gradientMyPageSummary } from "../../theme/gradients";
import { colors, shadows } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

type MenuRow = {
  label: string;
  detail?: string;
  icon: IconName;
  onPress: () => void;
};

// 시안(Figma 10-1)처럼 섹션마다 흰 카드 하나에 행을 담고, 행 사이에는 구분선을 둔다.
function MenuCard({ rows, footer }: { rows: MenuRow[]; footer?: ReactNode }) {
  return (
    <View style={styles.menuCard}>
      {rows.map((row, index) => {
        const hasDivider = index < rows.length - 1 || footer !== undefined;
        return (
          <Pressable
            accessibilityLabel={row.label}
            accessibilityRole="button"
            key={row.label}
            onPress={row.onPress}
            style={[styles.menuRow, row.detail ? styles.menuRowTall : null]}
          >
            <GradientView token={gradientMyPageBadge} style={styles.iconBadge}>
              <Icon name={row.icon} size={20} width={20} height={20} color={colors.brown} />
            </GradientView>
            <View style={styles.menuText}>
              <Text style={styles.menuLabel}>{row.label}</Text>
              {row.detail ? <Text style={styles.menuDetail}>{row.detail}</Text> : null}
            </View>
            <Icon name="vector-next" size={26} width={6.9} height={11.84} color={colors.brown2} />
            {hasDivider ? <View style={styles.rowDivider} /> : null}
          </Pressable>
        );
      })}
      {footer}
    </View>
  );
}

export default function MyPageScreen() {
  const router = useRouter();
  const { profile, records, resetSession } = useMockSession();
  const distance = records.reduce((sum, record) => sum + record.distanceMeters, 0) / 1000;

  const comingSoon = (title: string) => () =>
    Alert.alert(title, "아직 준비 중인 기능이에요.");

  const logout = () =>
    Alert.alert("로그아웃", "앱에 임시 저장된 목업 데이터가 초기화돼요.", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        onPress: () => {
          resetSession();
          router.dismissAll();
          router.replace("/1-2");
        },
      },
    ]);

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
          <Icon name="icon-settings" size={22} width={22} height={22} color={colors.brown} />
        </Pressable>
      </View>

      <View style={styles.profile}>
        <Text style={styles.profileName}>{profile.nickname} 님</Text>
        <View style={styles.levelBadge}>
          <Icon name="icon-shield" size={16} width={16} height={16} color={colors.brown3} />
          <Text style={styles.levelText}>산책 레벨 3</Text>
        </View>
      </View>

      <GradientView token={gradientMyPageSummary} style={styles.summaryCard}>
        {/* 각 열은 위 줄(아이콘 + 값, 세로 가운데 정렬)과 아래 줄(라벨)이며 둘 다 열 왼쪽에 붙는다. */}
        <View style={[styles.stat, styles.statWalks]}>
          <View style={styles.statValueRow}>
            <Icon name="icon-dog" size={20} width={20} height={20} color={colors.deepOrange} />
            <Text style={styles.statValue}>{records.length}회</Text>
          </View>
          <Text style={styles.statLabel}>총 산책</Text>
        </View>
        <View style={[styles.stat, styles.statDistance]}>
          <View style={styles.statValueRow}>
            <Icon name="icon-footprints" size={24} width={24} height={24} color={colors.deepOrange} />
            <Text style={styles.statValue}>{distance.toFixed(1)} km</Text>
          </View>
          <Text style={styles.statLabel}>총 거리</Text>
        </View>
        <View style={[styles.stat, styles.statDogs]}>
          <View style={styles.statValueRow}>
            <Icon name="icon-pets" size={18} width={18} height={18} color={colors.deepOrange} />
            <Text style={styles.statValue}>
              {new Set(records.map((record) => record.dogId)).size}마리
            </Text>
          </View>
          <Text style={styles.statLabel}>함께한 강아지</Text>
        </View>
      </GradientView>

      <View style={styles.sectionInfo}>
        <Text style={styles.sectionTitle}>내 정보</Text>
        <MenuCard
          rows={[
            {
              label: "내 정보 수정",
              detail: "닉네임 · 프로필 사진 · 전화번호",
              icon: "icon-user",
              onPress: () => router.push("/10-2"),
            },
            {
              label: "산책 선호 설정",
              detail: "산책 지역 · 강아지 크기",
              icon: "icon-tune",
              onPress: () => router.push("/10-3"),
            },
          ]}
        />
      </View>

      <View style={styles.sectionWalks}>
        <Text style={styles.sectionTitle}>나의 산책</Text>
        <MenuCard
          rows={[
            {
              label: "산책 기록",
              icon: "icon-schedule",
              onPress: () => router.push("/9-1"),
            },
            {
              label: "예약 내역",
              icon: "icon-calendar",
              onPress: () => router.push("/8-1"),
            },
          ]}
        />
      </View>

      <View style={styles.sectionOther}>
        <Text style={styles.sectionTitle}>기타</Text>
        <MenuCard
          rows={[
            {
              label: "알림 설정",
              icon: "icon-notifications",
              onPress: comingSoon("알림 설정"),
            },
            {
              label: "고객센터",
              icon: "icon-help",
              onPress: comingSoon("고객센터"),
            },
          ]}
          footer={
            <Pressable
              accessibilityLabel="로그아웃"
              accessibilityRole="button"
              onPress={logout}
              style={styles.logoutRow}
            >
              <Text style={styles.logoutText}>로그아웃</Text>
            </Pressable>
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 30 },
  header: {
    alignSelf: "center",
    height: 62,
    width: 375,
  },
  headerTitle: {
    color: colors.brown2,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 28,
    left: 24,
    lineHeight: 39,
    position: "absolute",
    top: 5,
  },
  settingsButton: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 22,
    elevation: 2,
    height: 44,
    justifyContent: "center",
    position: "absolute",
    right: 24,
    shadowColor: shadows.myPageCard.color,
    shadowOffset: { width: shadows.myPageCard.offsetX, height: shadows.myPageCard.offsetY },
    shadowOpacity: 1,
    shadowRadius: shadows.myPageCard.blurRadius,
    top: 0,
    width: 44,
  },
  profile: {
    alignSelf: "center",
    height: 56,
    justifyContent: "center",
    paddingHorizontal: 20,
    width: 375,
  },
  profileName: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 30,
    lineHeight: 42,
  },
  levelBadge: {
    alignItems: "center",
    backgroundColor: colors.peach,
    borderRadius: 14,
    flexDirection: "row",
    height: 28,
    paddingHorizontal: 10,
    position: "absolute",
    right: 39,
    top: 14,
  },
  levelText: {
    color: colors.brown3,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 12,
    marginLeft: 4,
  },
  summaryCard: {
    alignSelf: "center",
    elevation: 2,
    flexDirection: "row",
    height: 82,
    marginBottom: 13,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    shadowColor: shadows.myPageCard.color,
    shadowOffset: { width: shadows.myPageCard.offsetX, height: shadows.myPageCard.offsetY },
    shadowOpacity: 1,
    shadowRadius: shadows.myPageCard.blurRadius,
    width: 335,
  },
  stat: {
    alignItems: "flex-start",
    paddingTop: 18,
  },
  // 열 시작 위치는 시안(Figma 10-1)의 14, 116.67, 237.33이다. 카드 안쪽 여백 14를 뺀 너비로 나눈다.
  statWalks: { width: 102.67 },
  statDistance: { width: 120.67 },
  statDogs: { flex: 1 },
  statValueRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    height: 25,
  },
  statValue: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 18,
    lineHeight: 25,
  },
  statLabel: {
    color: colors.brown3,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 7,
  },
  // 섹션 사이 간격은 시안의 섹션 높이(208, 190, 238)를 그대로 따른다.
  sectionInfo: { alignSelf: "center", height: 208, width: 375 },
  sectionWalks: { alignSelf: "center", height: 190, width: 375 },
  sectionOther: { alignSelf: "center", height: 238, width: 375 },
  sectionTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 16,
    left: 24,
    lineHeight: 22,
    position: "absolute",
    top: 4,
  },
  menuCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    elevation: 2,
    left: 20,
    padding: 6,
    position: "absolute",
    right: 20,
    shadowColor: shadows.myPageCard.color,
    shadowOffset: { width: shadows.myPageCard.offsetX, height: shadows.myPageCard.offsetY },
    shadowOpacity: 1,
    shadowRadius: shadows.myPageCard.blurRadius,
    top: 29,
  },
  menuRow: {
    alignItems: "center",
    flexDirection: "row",
    height: 62,
    paddingLeft: 8,
    paddingRight: 12,
  },
  menuRowTall: { height: 78 },
  iconBadge: {
    alignItems: "center",
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  menuText: {
    flex: 1,
    marginLeft: 14,
  },
  menuLabel: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 15,
    lineHeight: 21,
  },
  menuDetail: {
    color: colors.brown3,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 10.5,
    lineHeight: 15,
    marginTop: 0,
  },
  rowDivider: {
    backgroundColor: colors.outer,
    bottom: 0,
    height: 1,
    left: 60,
    position: "absolute",
    right: 16,
  },
  logoutRow: {
    alignItems: "center",
    height: 62,
    justifyContent: "center",
  },
  logoutText: {
    color: colors.brown3,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 15,
    lineHeight: 21,
  },
});
