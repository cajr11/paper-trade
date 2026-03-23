import { Colors } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { TextInput, type TextInputProps } from "react-native";

type ThemedTextInputProps = {
  placeholder: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps["keyboardType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  autoCorrect?: boolean;
};

export default function ThemedTextInput({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoCorrect,
}: ThemedTextInputProps) {
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
      placeholderTextColor={Colors[theme].secondaryText}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
    />
  );
}
