import { Component, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SPECTRAL_NAVY, PENSIEVE_SILVER_BLUE } from "@/constants/colors";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.text}>
            Something went wrong.{"\n"}Please restart the app.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SPECTRAL_NAVY,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  text: {
    color: PENSIEVE_SILVER_BLUE,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
  },
});
