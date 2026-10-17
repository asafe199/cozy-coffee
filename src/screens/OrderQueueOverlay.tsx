import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Order } from '../game/types';
import { orderWords } from '../i18n';
import { describeOrder } from '../game/orders';

const NOGUEIRA = '#4A2F1F';
const AMBAR = '#F3B45A';
const CREME = '#F6E3C7';

/**
 * Pending orders read off the board, oldest first. The player may tap any
 * card; there is no expiry or penalty for choosing out of order.
 */
export function OrderQueueOverlay({
  orders,
  onPick,
  fontLoaded = false,
}: {
  orders: Order[];
  onPick: (orderId: string) => void;
  fontLoaded?: boolean;
}) {
  if (orders.length === 0) {
    return null;
  }
  const font = fontLoaded ? { fontFamily: 'Figtree_600SemiBold' } : undefined;
  return (
    <View style={styles.row} pointerEvents="box-none">
      {orders.map((order, index) => (
        <Pressable key={order.id} style={styles.card} onPress={() => onPick(order.id)}>
          <Text style={[styles.number, font]}>{index + 1}</Text>
          <Text style={[styles.text, font]}>{describeOrder(order, orderWords())}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  card: {
    flex: 1,
    maxWidth: 180,
    backgroundColor: `${NOGUEIRA}EE`,
    borderColor: AMBAR,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 4,
  },
  number: { color: AMBAR, fontSize: 18 },
  text: { color: CREME, fontSize: 14 },
});
