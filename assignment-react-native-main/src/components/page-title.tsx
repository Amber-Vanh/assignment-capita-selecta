import { StyleSheet, Text } from "react-native";

export function PageTitle({
  children,
  color,
  top = 104,
}: {
  children: string;
  color: string;
  top?: number;
}) {
  return <Text style={[styles.title, { color, top }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: {
    position: "absolute",
    left: 0,
    right: 0,
    fontSize: 44,
    lineHeight: 44,
    fontFamily: "ClimateCrisis",
    textAlign: "center",
  },
});
