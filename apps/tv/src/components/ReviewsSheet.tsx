// ReviewsSheet — the web app's reviews-as-comments experience, TV-adapted.
// Community reactions surfaced next to the preview so viewers can "read the
// room" before committing. Opens as a right-side panel (the TV idiom for
// supplemental content — bottom sheets are a touch pattern).
//
// Focus: the Close button takes focus when the sheet opens. Each review row
// is lightly focusable so D-pad up/down walks — and thereby scrolls — the
// list. Select on Close (or the Menu button, via the parent unmounting on
// blur navigation) dismisses.
import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableHighlight,
  StyleSheet,
} from "react-native";
import type { Content, Review } from "../api/client";
import { FocusableButton } from "./FocusableButton";
import { colors, spacing, radii, type as typeScale } from "../theme/tokens";

type Props = {
  content: Content;
  onClose: () => void;
};

const SENTIMENT_LABEL: Record<Review["sentiment"], string> = {
  loved: "Loved it",
  liked: "Liked it",
  mixed: "Mixed",
};

const SENTIMENT_COLOR: Record<Review["sentiment"], string> = {
  loved: colors.match,
  liked: colors.brandStrong,
  mixed: colors.rating,
};

export function ReviewsSheet({ content, onClose }: Props) {
  return (
    <View style={styles.scrim}>
      <View style={styles.sheet}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Reviews</Text>
            <Text style={styles.subtitle}>
              ★ {content.rating.toFixed(1)} · {content.reviews.length} reviews
              · {content.title}
            </Text>
          </View>
          <FocusableButton
            onPress={onClose}
            hasTVPreferredFocus
            style={styles.closeButton}
            accessibilityLabel="Close reviews"
          >
            <Text style={styles.closeLabel}>Close</Text>
          </FocusableButton>
        </View>

        <FlatList
          data={content.reviews}
          keyExtractor={(r) => r.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <ReviewRow review={item} />}
        />
      </View>
    </View>
  );
}

function ReviewRow({ review }: { review: Review }) {
  const [focused, setFocused] = useState(false);

  return (
    <TouchableHighlight
      underlayColor="transparent"
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      accessibilityLabel={`Review by ${review.author}: ${review.body}`}
    >
      <View style={[styles.row, focused && styles.rowFocused]}>
        <View style={[styles.avatar, { backgroundColor: review.avatarColor }]}>
          <Text style={styles.avatarInitial}>
            {review.author.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.rowBody}>
          <View style={styles.rowMeta}>
            <Text style={styles.author}>{review.author}</Text>
            <Text style={styles.timeAgo}>{review.timeAgo}</Text>
            <Text
              style={[
                styles.sentiment,
                { color: SENTIMENT_COLOR[review.sentiment] },
              ]}
            >
              {SENTIMENT_LABEL[review.sentiment]}
            </Text>
          </View>
          <Text style={styles.stars}>
            {"★".repeat(review.rating)}
            <Text style={styles.starsEmpty}>
              {"★".repeat(5 - review.rating)}
            </Text>
          </Text>
          <Text style={styles.body}>{review.body}</Text>
          <Text style={styles.likes}>♡ {review.likes}</Text>
        </View>
      </View>
    </TouchableHighlight>
  );
}

const SHEET_WIDTH = 640;

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlaySoft,
    alignItems: "flex-end",
  },
  sheet: {
    width: SHEET_WIDTH,
    height: "100%",
    backgroundColor: colors.surface,
    borderLeftWidth: 1,
    borderLeftColor: colors.chipBorder,
    paddingTop: spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.chipBg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typeScale.heading,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.textTertiary,
    fontSize: typeScale.small,
    marginTop: spacing.xs,
  },
  closeButton: {
    backgroundColor: colors.chipBg,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  closeLabel: {
    color: colors.textPrimary,
    fontSize: typeScale.caption,
    fontWeight: "700",
  },
  list: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
  },
  rowFocused: {
    backgroundColor: colors.surfaceRaised,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: colors.textPrimary,
    fontSize: typeScale.body,
    fontWeight: "800",
  },
  rowBody: {
    flex: 1,
  },
  rowMeta: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
  },
  author: {
    color: colors.textPrimary,
    fontSize: typeScale.caption,
    fontWeight: "700",
  },
  timeAgo: {
    color: colors.textTertiary,
    fontSize: typeScale.small,
  },
  sentiment: {
    fontSize: typeScale.small,
    fontWeight: "700",
  },
  stars: {
    color: colors.rating,
    fontSize: typeScale.small,
    marginTop: 2,
  },
  starsEmpty: {
    color: colors.chipBorder,
  },
  body: {
    color: colors.textSecondary,
    fontSize: typeScale.caption,
    lineHeight: 24,
    marginTop: spacing.xs,
  },
  likes: {
    color: colors.textTertiary,
    fontSize: typeScale.small,
    marginTop: spacing.sm,
  },
});
