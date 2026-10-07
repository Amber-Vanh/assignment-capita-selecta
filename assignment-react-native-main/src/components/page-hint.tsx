import { StyleSheet, Text } from "react-native";

export function PageHint({ children, color }: { children: string; color: string }) {
  return <Text style={[styles.hint, { color }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  hint: {
    position: "absolute",
    bottom: 88,
    left: 0,
    right: 0,
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 1.5,
    textAlign: "center",
    textTransform: "uppercase",
    paddingHorizontal: 40,
  },
});
