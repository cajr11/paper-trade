import { Colors } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { TextInput } from "react-native";

type ThemedTextInputProps = {
  placeholder: string;
};

export default function ThemedTextInput({ placeholder }: ThemedTextInputProps) {
  const { theme } = useTheme();

  return (
    <TextInput
      style={{
        height: 50,
        width: "100%",
        padding: 16,
        borderRadius: 12,
        color: Colors[theme].text,
        backgroundColor: Colors[theme].backgroundElement,
      }}
      placeholder={placeholder}
    />
  );
}
