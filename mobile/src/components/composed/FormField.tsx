import { ThemedText } from "../ui/ThemedText";
import ThemedTextInput from "../ui/ThemedTextInput";
import { ThemedView } from "../ui/ThemedView";
import type { TextInputProps } from "react-native";

type FormFieldProps = {
  label: string;
  placeholder: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps["keyboardType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  autoCorrect?: boolean;
};

export default function FormField({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoCorrect,
}: FormFieldProps) {
  return (
    <ThemedView
      style={{
        gap: 20,
      }}
    >
      <ThemedText>{label}</ThemedText>
      <ThemedTextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
      />
    </ThemedView>
  );
}
