import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
} from "react-native";

import { fetchPolicyDocument, type PrivacyPolicy } from "../api/users";
import { colors, typography } from "../theme/tokens";
import { fontFamilies } from "../theme/typography";

type PolicyContentProps = {
  kind: "terms" | "privacy";
  titleStyle?: StyleProp<TextStyle>;
  textColor?: string;
};

type Block = { kind: "heading" | "text" | "gap"; text: string };

// 마크다운을 간단한 글로 바꾼다. 제목은 굵게, 목록은 점으로, 강조 기호는 지운다.
function toBlocks(markdown: string): Block[] {
  return markdown.split(/\r?\n/).map((line): Block => {
    const heading = /^#{1,6}\s+(.*)$/.exec(line);
    if (heading) return { kind: "heading", text: stripInline(heading[1]) };
    if (!line.trim()) return { kind: "gap", text: "" };
    return {
      kind: "text",
      text: stripInline(line.replace(/^\s*[-*]\s+/, "• ")),
    };
  });
}

function stripInline(value: string) {
  return value.replace(/\*\*|__|`/g, "").trim();
}

// 서버의 정책 문서(GET /policies/{kind})를 보여 준다. 내용 영역은 스크롤된다.
export function PolicyContent({
  kind,
  titleStyle,
  textColor = colors.black,
}: PolicyContentProps) {
  const [document, setDocument] = useState<PrivacyPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    void fetchPolicyDocument(kind).then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (res.ok) {
        setDocument(res.data);
      } else {
        setFailed(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [kind]);

  useEffect(() => load(), [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={[styles.body, { color: textColor }]}>불러오는 중...</Text>
      </View>
    );
  }

  if (failed || !document) {
    return (
      <View style={styles.center}>
        <Text style={[styles.body, { color: textColor }]}>
          문서를 불러오지 못했어요.
        </Text>
        <Pressable
          accessibilityLabel="다시 시도"
          accessibilityRole="button"
          onPress={load}
        >
          <Text style={styles.retry}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}
    >
      <Text style={[styles.title, { color: textColor }, titleStyle]}>
        {document.title}
      </Text>
      <Text style={[styles.version, { color: textColor }]}>
        버전 {document.document_version}
      </Text>
      {toBlocks(document.content).map((block, index) =>
        block.kind === "gap" ? (
          <View key={index} style={styles.gap} />
        ) : (
          <Text
            key={index}
            style={[
              block.kind === "heading" ? styles.heading : styles.body,
              { color: textColor },
            ]}
          >
            {block.text}
          </Text>
        ),
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  center: {
    alignItems: "center",
    flex: 1,
    gap: 12,
    justifyContent: "center",
  },
  title: {
    fontFamily: fontFamilies.notoSansKRBold,
    fontSize: typography.fontSizes.bodyLarge,
    lineHeight: 22,
  },
  version: {
    fontFamily: fontFamilies.notoSansKRRegular,
    fontSize: typography.fontSizes.small,
    lineHeight: 18,
    marginBottom: 8,
  },
  heading: {
    fontFamily: fontFamilies.notoSansKRBold,
    fontSize: typography.fontSizes.body,
    lineHeight: 22,
    marginTop: 8,
  },
  body: {
    fontFamily: fontFamilies.notoSansKRRegular,
    fontSize: typography.fontSizes.body,
    lineHeight: 20,
  },
  gap: {
    height: 6,
  },
  retry: {
    color: colors.brown,
    fontFamily: fontFamilies.notoSansKRBold,
    fontSize: typography.fontSizes.body,
    textDecorationLine: "underline",
  },
});
