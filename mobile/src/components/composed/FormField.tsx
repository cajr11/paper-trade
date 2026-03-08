import { ThemedText } from "../ui/ThemedText";
import ThemedTextInput from "../ui/ThemedTextInput";
import { ThemedView } from "../ui/ThemedView";

type FormFieldProps = {
  label: string;
  placeholder: string;
};

export default function FormField({ label, placeholder }: FormFieldProps) {
  return (
    <ThemedView
      style={{
        gap: 20,
      }}
    >
      <ThemedText>{label}</ThemedText>
      <ThemedTextInput placeholder={placeholder} />
    </ThemedView>
  );
}
