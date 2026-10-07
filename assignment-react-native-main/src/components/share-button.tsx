import { useCallback, type RefObject } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type View,
  type ViewStyle,
} from "react-native";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";

export function ShareButton({
  captureRef: target,
  color,
  style,
  label = "Share this fortune",
}: {
  captureRef: RefObject<View | null>;
  color: string;
  style?: StyleProp<ViewStyle>;
  label?: string;
}) {
  const handleShare = useCallback(async () => {
    if (!target.current) return;

    try {
      const uri = await captureRef(target, {
        quality: 1,
        format: "png",
        result: "tmpfile",
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "Share this fortune",
        });
      } else {
        Alert.alert("Sharing isn't available", "This device can't open the share sheet.");
      }
    } catch {
      Alert.alert("Couldn't share", "Something went wrong while preparing your fortune.");
    }
  }, [target]);

  return (
    <Pressable style={[styles.button, { borderColor: color }, style]} onPress={handleShare}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  text: {
    fontWeight: "600",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
