import { Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

const WAX_SEAL_ASSET = require("../assets/wax-seal.png");

export function PensieveButton() {
  const router = useRouter();

  return (
    <Pressable style={styles.button} onPress={() => router.push("/history")}>
      <Image source={WAX_SEAL_ASSET} style={styles.seal} contentFit="contain" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: 40,
    right: 16,
    zIndex: 10,
    width: 60,
    height: 60,
  },
  seal: {
    width: "100%",
    height: "100%",
  },
});
