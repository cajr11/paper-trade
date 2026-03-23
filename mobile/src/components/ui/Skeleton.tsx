import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, type ViewStyle } from "react-native";
import { useTheme } from "@/hooks/useTheme";

type SkeletonProps = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
};

export default function Skeleton({
  width = "100%",
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor: colors.backgroundElement,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function CardSkeleton() {
  return (
    <View style={cardStyles.card}>
      <Skeleton width={140} height={14} />
      <Skeleton width={200} height={36} style={{ marginTop: 8 }} />
      <View style={cardStyles.row}>
        <Skeleton width={100} height={14} />
        <Skeleton width={100} height={14} />
      </View>
    </View>
  );
}

export function RowSkeleton() {
  return (
    <View style={cardStyles.row}>
      <View style={{ gap: 6, flex: 1 }}>
        <Skeleton width={80} height={16} />
        <Skeleton width={120} height={12} />
      </View>
      <Skeleton width={70} height={16} />
    </View>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View style={{ gap: 8 }}>
      {Array.from({ length: count }).map((_, i) => (
        <RowSkeleton key={i} />
      ))}
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    padding: 24,
    borderRadius: 16,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
});
