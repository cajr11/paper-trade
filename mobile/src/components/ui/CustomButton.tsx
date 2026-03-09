import { Pressable, Text, View } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Colors } from "@/constants/theme";

type CustomButtonProps = {
  label: string;
  onPress(): void;
  inverse?: boolean;
};

export default function CustomButton({ label, onPress }: CustomButtonProps) {
  const { theme } = useTheme();

  // invert color shceme so light mode uses black buttons etc
  const colorScheme = theme === "light" ? "dark" : "light";

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: Colors[colorScheme].background,
        height: 52,
        borderRadius: 12,
      }}
    >
      <View
        style={{
          flex: 1,
          padding: 16,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: Colors[colorScheme].text,
            fontFamily: "Outfit",
            fontWeight: 800,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
