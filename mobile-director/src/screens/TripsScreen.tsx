import { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/types";
import { fetchTrips } from "../api/client";
import { colors, tripStatusLabels } from "../theme";
import { CenteredSpinner, EmptyState, FAB, StatusBadge } from "../components/ui";
import type { Trip } from "../api/types";

type Props = NativeStackScreenProps<RootStackParamList, "Trips">;

export function TripsScreen({ navigation }: Props) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const { trips } = await fetchTrips();
      setTrips(trips);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <CenteredSpinner />;

  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
        ListEmptyComponent={<EmptyState text="Aucune tournée." />}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => navigation.navigate("TripDetail", { tripId: item.id })}>
            <View style={styles.rowTop}>
              <Text style={styles.rowTitle}>
                {item.driver.firstName} {item.driver.lastName} · {item.tractor.plateNumber}
              </Text>
              <StatusBadge status={item.status} labels={tripStatusLabels} />
            </View>
            <Text style={styles.rowSubtitle}>{item.origin} → {item.destination}</Text>
            <Text style={styles.rowMeta}>
              {new Date(item.departureAt).toLocaleString("fr-FR")} · {item.orders?.length ?? 0} commande(s)
            </Text>
          </Pressable>
        )}
      />
      <FAB onPress={() => navigation.navigate("TripForm")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  listContent: { padding: 16, paddingBottom: 90 },
  row: { backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 10 },
  rowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  rowTitle: { fontSize: 14, fontWeight: "700", color: colors.text, flex: 1 },
  rowSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  rowMeta: { fontSize: 11, color: colors.textFaint, marginTop: 4 },
});
