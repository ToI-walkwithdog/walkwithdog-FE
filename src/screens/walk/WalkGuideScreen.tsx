import { useEffect, useRef, useState } from "react";
import { usePreventRemove, useLocalSearchParams, useRouter } from "expo-router";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance,
} from "react-native";

import { markWalkGuideSeen } from "../../api/walkGuideSeen";
import { getTrackerSnapshot } from "../../api/walkTracker";
import { Icon } from "../../components/Icon";
import { OnboardingBackground } from "../../components/OnboardingBackground";
import { OnboardingPillButton } from "../../components/OnboardingPillButton";
import { Screen } from "../../components/Screen";
import { colors, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";
import { walkGuideCards } from "./walkGuideContent";

const pawStamp = require("../../assets/images/paw-1.png");

const PAGE_WIDTH = 375;
// 발바닥 글머리는 원본(paw-1.png, 512x512)과 같은 1:1이다. 가로와 세로에 같은 값을 쓴다.
const PAW_SIZE = 20;
const POINT_LINE_HEIGHT = 22;
const LAST = walkGuideCards.length - 1;

// 첫 산책 가이드. Figma 시안이 없어 서약 화면(1-6)의 배경, 카드, 발바닥 글머리와 같은 모양으로 만들었다.
// from=start: 홈의 "산책 시작하개"에서 처음 한 번 보이고, 끝내거나 건너뛰면 가이드를 본 것으로 기록한 뒤 4-1로 간다.
// from=menu(기본): 마이페이지에서 언제든 열며, 본 기록은 건드리지 않고 닫으면 돌아간다.
export default function WalkGuideScreen() {
  const router = useRouter();
  const { from, uid } = useLocalSearchParams<{ from?: string; uid?: string }>();
  const fromStart = from === "start";
  const userId = uid !== undefined && Number.isFinite(Number(uid)) ? Number(uid) : null;
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollViewInstance>(null);

  // 진행 중인 산책(재로그인 뒤 복구 포함)이 있으면 가이드를 건너뛰고 산책 화면으로 간다.
  useEffect(() => {
    if (fromStart && getTrackerSnapshot().walkId !== null) router.replace("/5-1");
  }, [fromStart, router]);

  const goTo = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * PAGE_WIDTH, animated: true });
    setPage(index);
  };

  // 뒤로 가기(안드로이드 버튼, iOS 가장자리 밀기)는 첫 카드가 아니면 이전 카드로 간다.
  // 첫 카드에서는 평소처럼 화면을 닫는다(이때는 가이드를 본 것으로 기록하지 않는다).
  usePreventRemove(page > 0, () => goTo(page - 1));

  const leave = () => {
    if (fromStart) {
      if (userId !== null) void markWalkGuideSeen(userId);
      router.replace("/4-1");
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/10-1");
    }
  };

  const onMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / PAGE_WIDTH);
    setPage(Math.min(LAST, Math.max(0, index)));
  };

  return (
    <Screen
      backgroundColor={colors.white}
      dismissKeyboardOnTap={false}
      safeAreaEdges={[]}
      testID="screen-4-guide"
    >
      <View style={styles.root}>
        <OnboardingBackground />

        <View style={styles.contentFrame}>
          <Pressable
            accessibilityLabel="건너뛰기"
            accessibilityRole="button"
            hitSlop={8}
            onPress={leave}
            style={styles.skip}
          >
            <Text style={styles.skipText}>건너뛰기</Text>
          </Pressable>

          <ScrollView
            horizontal
            onMomentumScrollEnd={onMomentumEnd}
            pagingEnabled
            ref={scrollRef}
            showsHorizontalScrollIndicator={false}
            style={styles.pager}
          >
            {walkGuideCards.map((card) => (
              <ScrollView
                contentContainerStyle={styles.pageContent}
                key={card.title}
                style={styles.page}
              >
                <View style={styles.iconFrame}>
                  <Icon name={card.icon} size={44} width={44} height={44} color={colors.orange} />
                </View>
                <Text style={styles.title}>{card.title}</Text>
                <Text style={styles.subtitle}>{card.subtitle}</Text>

                <View style={styles.card}>
                  {card.points.map((point) => (
                    <View key={point} style={styles.pointRow}>
                      <Image accessible={false} source={pawStamp} style={styles.bulletPaw} />
                      <Text style={styles.pointText}>{point}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            ))}
          </ScrollView>

          <View
            accessible
            accessibilityLabel={`${page + 1} / ${walkGuideCards.length}`}
            style={styles.dots}
          >
            {walkGuideCards.map((card, index) => (
              <View key={card.title} style={[styles.dot, index === page && styles.dotActive]} />
            ))}
          </View>
        </View>

        <OnboardingPillButton
          title={page === LAST ? "시작하기" : "다음"}
          onPress={() => (page === LAST ? leave() : goTo(page + 1))}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: "100%",
  },
  contentFrame: {
    alignSelf: "center",
    flex: 1,
    width: PAGE_WIDTH,
  },
  skip: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    position: "absolute",
    right: 12,
    top: 12,
    zIndex: 1,
    paddingHorizontal: 12,
  },
  skipText: {
    color: colors.brown2,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.subtitle,
  },
  pager: {
    flex: 1,
    marginTop: 56,
  },
  page: {
    width: PAGE_WIDTH,
  },
  pageContent: {
    alignItems: "center",
    paddingBottom: 190,
    paddingHorizontal: 22,
    paddingTop: 24,
  },
  iconFrame: {
    alignItems: "center",
    height: 55,
    justifyContent: "center",
    width: 55,
  },
  title: {
    color: colors.brown,
    fontFamily: fontFamilies.gumiRomance,
    fontSize: 28,
    letterSpacing: -0.28,
    lineHeight: 42,
    marginTop: 16,
    textAlign: "center",
  },
  subtitle: {
    color: colors.brown,
    fontFamily: fontFamilies.pretendardRegular,
    fontSize: typography.fontSizes.subtitle,
    lineHeight: 22,
    marginTop: 8,
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.pledgeCardBackground,
    borderRadius: 15,
    marginTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 8,
    paddingTop: 24,
    width: 331,
  },
  pointRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    marginBottom: 16,
  },
  bulletPaw: {
    alignSelf: "flex-start",
    aspectRatio: 1,
    height: PAW_SIZE,
    // 첫 줄의 세로 가운데에 맞춘다.
    marginTop: (POINT_LINE_HEIGHT - PAW_SIZE) / 2,
    marginRight: 12,
    resizeMode: "contain",
    width: PAW_SIZE,
  },
  pointText: {
    color: colors.pledgeText,
    flex: 1,
    fontFamily: fontFamilies.pretendardRegular,
    fontSize: typography.fontSizes.bodyLarge,
    lineHeight: POINT_LINE_HEIGHT,
  },
  dots: {
    alignItems: "center",
    alignSelf: "center",
    bottom: 131,
    flexDirection: "row",
    height: 12,
    position: "absolute",
  },
  dot: {
    backgroundColor: colors.lightOrange,
    borderRadius: 4,
    height: 8,
    marginHorizontal: 4,
    opacity: 0.5,
    width: 8,
  },
  dotActive: {
    backgroundColor: colors.orange,
    opacity: 1,
    width: 22,
  },
});
