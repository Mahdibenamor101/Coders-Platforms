import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/types";
import { fetchTrips, type Driver, type Trip } from "../api/client";
import { clearSession, getSession } from "../storage/session";
import { colors, statusColors, statusLabels } from "../theme";
import { useLocationReporter } from "../hooks/useLocationReporter";

type Props = NativeStackScreenProps<RootStackParamList, "Missions">;

export function MissionsScreen({ navigation }: Props) {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [session, setSession] = useState<{ baseUrl: string; token: string } | null>(null);

  const hasActiveTrip = trips.some((t) => t.status === "IN_PROGRESS");
  useLocationReporter(session?.baseUrl ?? "", session?.token ?? "", Boolean(session) && hasActiveTrip);

  const load = useCallback(async (isRefresh = false) => {
    const s = await getSession();
    if (!s) {
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      return;
    }
    setSession(s);
    if (isRefresh) setRefreshing(true);
    try {
      const data = await fetchTrips(s.baseUrl, s.token);
      setDriver(data.driver);
      setTrips(data.trips);
    } catch {
      // keep last known data on a transient network error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleLogout} hitSlop={10}>
          <Text style={styles.logout}>Déconnexion</Text>
        </Pressable>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  async function handleLogout() {
    await clearSession();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.listContent}
      data={trips}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
      ListHeaderComponent={
        driver ? (
          <View style={styles.header}>
            <Text style={styles.greeting}>Bonjour</Text>
            <Text style={styles.name}>{driver.firstName} {driver.lastName}</Text>
          </View>
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Aucune tournée assignée pour le moment.</Text>
        </View>
      }
      renderItem={({ item: trip }) => (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.plate}>
              {trip.tractor.plateNumber}
              {trip.trailer ? ` / ${trip.trailer.plateNumber}` : ""}
            </Text>
            <StatusBadge status={trip.status} />
          </View>
          <Text style={styles.route}>
            {trip.origin} → {trip.destination}
          </Text>

          {trip.status === "IN_PROGRESS" && (
            <Pressable
              style={styles.dashcamButton}
              onPress={() => navigation.navigate("Dashcam", { tripId: trip.id })}
            >
              <Text style={styles.dashcamButtonText}>📹 Dashcam</Text>
            </Pressable>
          )}

          {trip.orders.length === 0 ? (
            <Text style={styles.noOrders}>Aucun arrêt assigné.</Text>
          ) : (
            trip.orders.map((order, idx) => (
              <Pressable
                key={order.id}
                style={styles.orderRow}
                onPress={() => navigation.navigate("OrderDetail", { orderId: order.id })}
              >
                <Text style={styles.orderText} numberOfLines={1}>
                  <Text style={styles.orderIndex}>{idx + 1}. </Text>
                  {order.customerName} - {order.deliveryAddress}
                </Text>
                <StatusBadge status={order.status} />
              </Pressable>
            ))
          )}
        </View>
      )}
    />
  );
}

function StatusBadge({ status }: { status: string }) {
  const c = statusColors[status] ?? { bg: colors.border, text: colors.textMuted };
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{statusLabels[status] ?? status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  listContent: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 16 },
  greeting: { fontSize: 13, color: colors.textMuted },
  name: { fontSize: 20, fontWeight: "700", color: colors.text },
  logout: { color: colors.primary, fontSize: 13, fontWeight: "600" },
  empty: { padding: 24, alignItems: "center" },
  emptyText: { color: colors.textMuted, fontSize: 14 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  plate: { fontWeight: "700", color: colors.text, fontSize: 14 },
  route: { fontSize: 12, color: colors.textMuted, marginBottom: 10 },
  dashcamButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.dangerBg,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  dashcamButtonText: { color: colors.danger, fontSize: 12, fontWeight: "600" },
  noOrders: { fontSize: 13, color: colors.textMuted },
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginTop: 6,
    gap: 8,
  },
  orderText: { flex: 1, fontSize: 13, color: colors.text },
  orderIndex: { color: colors.textFaint, fontWeight: "700" },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: "600" },
});
