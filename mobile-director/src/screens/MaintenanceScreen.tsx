import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/types";
import { deleteMaintenanceRecord, fetchMaintenanceRecords } from "../api/client";
import { colors } from "../theme";
import { CenteredSpinner, EmptyState, FAB } from "../components/ui";
import type { MaintenanceRecord } from "../api/types";

type Props = NativeStackScreenProps<RootStackParamList, "Maintenance">;

const TYPE_LABELS: Record<string, string> = {
  OIL_CHANGE: "Vidange",
  TIRES: "Pneus",
  BRAKES: "Freins",
  INSPECTION: "Inspection",
  REPAIR: "Réparation",
  OTHER: "Autre",
};

export function MaintenanceScreen({ navigation }: Props) {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const { records } = await fetchMaintenanceRecords();
      setRecords(records);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  function handleDelete(id: string) {
    Alert.alert("Supprimer cette intervention ?", "Cette action est irréversible.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          await deleteMaintenanceRecord(id);
          load();
        },
      },
    ]);
  }

  if (loading) return <CenteredSpinner />;

  return (
    <View style={styles.container}>
      <FlatList
        data={records}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
        ListEmptyComponent={<EmptyState text="Aucune intervention enregistrée." />}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onLongPress={() => handleDelete(item.id)}>
            <View style={styles.rowTop}>
              <Text style={styles.rowTitle}>{TYPE_LABELS[item.type] ?? item.type}</Text>
              <Text style={styles.rowDate}>{item.performedAt.slice(0, 10)}</Text>
            </View>
            <Text style={styles.rowSubtitle}>
              {item.tractor?.plateNumber ?? item.trailer?.plateNumber ?? ""}
              {item.mileage != null ? ` · ${item.mileage.toLocaleString("fr-FR")} km` : ""}
              {item.cost != null ? ` · ${item.cost} €` : ""}
            </Text>
            {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
          </Pressable>
        )}
      />
      <FAB onPress={() => navigation.navigate("MaintenanceForm")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  listContent: { padding: 16, paddingBottom: 90 },
  row: { backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 10 },
  rowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
  rowDate: { fontSize: 12, color: colors.textFaint },
  rowSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  notes: { fontSize: 12, color: colors.text, marginTop: 4 },
});
