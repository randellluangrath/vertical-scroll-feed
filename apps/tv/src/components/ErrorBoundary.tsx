// App-wide error boundary.
//
// Catches render/lifecycle errors anywhere in the React tree below it and shows
// a branded fallback instead of a white screen or a redbox in production.
//
// Caveats (React boundaries can't catch these): errors thrown in event
// handlers, in async callbacks, or during SSR. TanStack Query errors surface
// through query state by default; to route them here instead, set
// `throwOnError: true` on a query — the QueryErrorResetBoundary in App.tsx will
// then let "Try again" reset those queries.
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FocusableButton } from "./FocusableButton";
import { colors, spacing, radii, type as typeScale } from "../theme/tokens";

type FallbackProps = {
  message?: string;
  onRetry?: () => void;
};

/** The presentational error screen (also usable on its own). */
export function ErrorFallback({
  message = "Something went wrong",
  onRetry,
}: FallbackProps) {
  return (
    <View style={styles.root}>
      <View style={styles.brandBlock}>
        <Text style={styles.brandMark}>
          Good<Text style={styles.brandAccent}>Watch</Text>
        </Text>
      </View>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      {onRetry && (
        <FocusableButton
          onPress={onRetry}
          hasTVPreferredFocus
          style={styles.retry}
          focusBorderColor={colors.brandStrong}
          underlayColor="#EDEDF7"
          accessibilityLabel="Try again"
        >
          <Text style={styles.retryLabel}>Try again</Text>
        </FocusableButton>
      )}
    </View>
  );
}

type Props = {
  children: React.ReactNode;
  /** Called when the user taps Try again — e.g. to reset failed queries. */
  onReset?: () => void;
  /** Override the fallback text; defaults to the caught error's message. */
  fallbackMessage?: string;
};

type State = { error: Error | null };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Surface to the JS console / a crash reporter (Sentry, etc.).
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  private handleRetry = () => {
    this.props.onReset?.();
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <ErrorFallback
          message={this.props.fallbackMessage ?? error.message}
          onRetry={this.handleRetry}
        />
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    padding: spacing.xxl,
  },
  brandBlock: {
    alignItems: "center",
    gap: spacing.sm,
  },
  brandMark: {
    color: colors.textPrimary,
    fontSize: typeScale.hero,
    fontWeight: "900",
    letterSpacing: -2,
  },
  brandAccent: {
    color: colors.brandStrong,
  },
  message: {
    color: colors.textTertiary,
    fontSize: typeScale.body,
    fontWeight: "500",
    textAlign: "center",
  },
  retry: {
    marginTop: spacing.sm,
    backgroundColor: colors.textPrimary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  retryLabel: {
    color: "#000000",
    fontSize: typeScale.body,
    fontWeight: "800",
  },
});
