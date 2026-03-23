import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

type FAQItem = {
  question: string;
  answer: string;
};

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "What is PaperTrade?",
    answer:
      "PaperTrade is a simulated crypto trading app. You get $10,000 virtual cash and trade with real prices. It's a risk-free way to practice trading strategies.",
  },
  {
    question: "Is real money involved?",
    answer:
      "No. PaperTrade uses only virtual money. You cannot deposit or withdraw real funds. All trades are simulated for educational purposes.",
  },
  {
    question: "Where do prices come from?",
    answer:
      "We fetch real-time prices from Binance's public API. The prices you see are actual market prices, but your trades don't affect the real market.",
  },
  {
    question: "How do I reset my balance?",
    answer:
      "Currently, you can create a new account to start fresh with $10,000. A balance reset feature is planned for a future update.",
  },
  {
    question: "Can I add coins to my watchlist?",
    answer:
      "Yes! Navigate to any coin's detail page and tap the star icon to add it to your watchlist. You can view your watchlist from the Watchlist tab.",
  },
  {
    question: "How do I delete my account?",
    answer:
      "Go to Profile > Security > Delete Account. This will permanently remove your account and all associated data.",
  },
];

export default function FAQScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backText, { color: colors.text }]}>{"\u2190"} Back</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>FAQ</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            {FAQ_ITEMS.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                )}
                <Pressable
                  onPress={() => toggleItem(index)}
                  style={({ pressed }) => [
                    styles.questionRow,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={[styles.question, { color: colors.text }]}>
                    {item.question}
                  </Text>
                  <Text style={[styles.expandIcon, { color: colors.secondaryText }]}>
                    {expandedIndex === index ? "\u2212" : "+"}
                  </Text>
                </Pressable>
                {expandedIndex === index && (
                  <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
                    <View style={styles.answerContainer}>
                      <Text style={[styles.answer, { color: colors.secondaryText }]}>
                        {item.answer}
                      </Text>
                    </View>
                  </Animated.View>
                )}
              </React.Fragment>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.two,
    marginBottom: Spacing.three,
  },
  backButton: {
    paddingVertical: Spacing.two,
  },
  backText: {
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "Outfit",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Outfit",
  },
  headerSpacer: {
    width: 50,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 100,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  questionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  question: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Outfit",
    paddingRight: 12,
  },
  expandIcon: {
    fontSize: 22,
    fontWeight: "300",
  },
  divider: {
    height: 1,
    marginHorizontal: Spacing.four,
  },
  answerContainer: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
  },
  answer: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 22,
    fontFamily: "Outfit",
  },
});
