import { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/types";
import { fetchDrivers } from "../api/client";
import { colors, driverStatusLabels } from "../theme";
import { CenteredSpinner, EmptyState, FAB, StatusBadge } from "../components/ui";
import type { Driver } from "../api/types";

type Props = NativeStackScreenProps<RootStackParamList, "Drivers">;

export function DriversScreen({ navigation }: Props) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const { drivers } = await fetchDrivers();
      setDrivers(drivers);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = drivers.filter((d) =>
    `${d.firstName} ${d.lastName} ${d.phone}`.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) return <CenteredSpinner />;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Rechercher (nom, téléphone)"
        placeholderTextColor={colors.textFaint}
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={filtered}
        keyExtractor={(d) => d.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
        ListEmptyComponent={<EmptyState text="Aucun chauffeur." />}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => navigation.navigate("DriverDetail", { driverId: item.id })}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>{item.firstName} {item.lastName}</Text>
              <Text style={styles.rowSubtitle}>{item.phone}</Text>
            </View>
            <StatusBadge status={item.status} labels={driverStatusLabels} />
          </Pressable>
        )}
      />
      <FAB onPress={() => navigation.navigate("DriverForm", {})} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  search: {
    margin: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: colors.card,
    color: colors.text,
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 90 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  rowInfo: { flex: 1, marginRight: 10 },
  rowTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
  rowSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
