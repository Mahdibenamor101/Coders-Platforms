import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/types";
import { fetchOrders, runAutoPlanning, ApiError } from "../api/client";
import { colors, orderStatusLabels, priorityLabels } from "../theme";
import { CenteredSpinner, EmptyState, FAB, StatusBadge } from "../components/ui";
import type { OrderSummary } from "../api/types";

type Props = NativeStackScreenProps<RootStackParamList, "Orders">;

export function OrdersScreen({ navigation }: Props) {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [planning, setPlanning] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const { orders } = await fetchOrders();
      setOrders(orders);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function handlePlan() {
    setPlanning(true);
    try {
      const result = await runAutoPlanning();
      Alert.alert(
        "Planification terminée",
        `${result.assigned} commande(s) assignée(s), ${result.routesTouched} tournée(s) mise(s) à jour.`
      );
      load(true);
    } catch (err) {
      Alert.alert("Erreur", err instanceof ApiError ? err.message : "La planification a échoué.");
    } finally {
      setPlanning(false);
    }
  }

  const filtered = orders.filter((o) =>
    `${o.reference} ${o.customerName} ${o.deliveryAddress}`.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) return <CenteredSpinner />;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Rechercher (référence, client, adresse)"
        placeholderTextColor={colors.textFaint}
        value={query}
        onChangeText={setQuery}
      />
      <Pressable style={styles.planButton} onPress={handlePlan} disabled={planning}>
        <Text style={styles.planButtonText}>{planning ? "Planification en cours..." : "⚡ Planifier automatiquement"}</Text>
      </Pressable>
      <FlatList
        data={filtered}
        keyExtractor={(o) => o.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
        ListEmptyComponent={<EmptyState text="Aucune commande." />}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}>
            <View style={styles.rowInfo}>
              <View style={styles.rowTop}>
                <Text style={styles.rowTitle}>{item.reference}</Text>
                <StatusBadge status={item.priority} labels={priorityLabels} />
              </View>
              <Text style={styles.rowSubtitle}>{item.customerName} · {item.deliveryAddress}</Text>
            </View>
            <StatusBadge status={item.status} labels={orderStatusLabels} />
          </Pressable>
        )}
      />
      <FAB onPress={() => navigation.navigate("OrderForm", {})} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  search: {
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: colors.card,
    color: colors.text,
  },
  planButton: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    backgroundColor: colors.blueBg,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  planButtonText: { color: colors.blue, fontWeight: "600", fontSize: 13 },
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 90 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 10,
  },
  rowInfo: { flex: 1 },
  rowTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  rowTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
  rowSubtitle: { fontSize: 12, color: colors.textMuted },
});
