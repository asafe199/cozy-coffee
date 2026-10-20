import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ReviewResult } from '../game/types';
import { t, reviewComment } from '../i18n';

const NOGUEIRA = '#4A2F1F';
const AMBAR = '#F3B45A';
const CREME = '#F6E3C7';

/**
 * Today's served customers, most recent first, each with its star count and
 * why it got that rating — reached by tapping the HUD's star count. Reviews
 * already existed (calculateReview); this is the first place they're shown
 * beyond the single last-order count.
 */
export function ReviewHistoryOverlay({ reviews, onClose }: { reviews: ReviewResult[]; onClose: () => void }) {
  const ordered = [...reviews].reverse();
  return (
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <Text style={styles.title}>{t('reviewHistoryTitle')}</Text>
        {ordered.length === 0 ? (
          <Text style={styles.empty}>{t('reviewEmpty')}</Text>
        ) : (
          <ScrollView style={styles.list}>
            {ordered.map((review, i) => (
              <View key={i} style={styles.row}>
                <Text style={styles.stars}>{'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}</Text>
                <Text style={styles.summary}>{review.summary}</Text>
                <Text style={styles.reason}>
                  {review.comments.length === 0 ? t('reviewAllGood') : review.comments.map(reviewComment).join(', ')}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>{t('back')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000AA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: NOGUEIRA,
    padding: 24,
    borderRadius: 12,
    gap: 12,
    alignItems: 'center',
    maxHeight: '75%',
    width: 320,
  },
  title: { color: CREME, fontFamily: 'Figtree_600SemiBold', fontSize: 20 },
  empty: { color: CREME, fontSize: 15 },
  list: { alignSelf: 'stretch' },
  row: {
    borderBottomColor: `${CREME}33`,
    borderBottomWidth: 1,
    paddingVertical: 10,
    gap: 2,
  },
  stars: { color: AMBAR, fontSize: 16 },
  summary: { color: CREME, fontSize: 14 },
  reason: { color: `${CREME}AA`, fontSize: 12 },
  closeButton: {
    marginTop: 4,
    backgroundColor: AMBAR,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeText: { color: NOGUEIRA, fontFamily: 'Figtree_600SemiBold', fontSize: 16 },
});
