import { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/types";
import { fetchTractors } from "../api/client";
import { colors, tractorTrailerStatusLabels } from "../theme";
import { CenteredSpinner, EmptyState, FAB, StatusBadge } from "../components/ui";
import type { Tractor } from "../api/types";

type Props = NativeStackScreenProps<RootStackParamList, "Tractors">;

export function TractorsScreen({ navigation }: Props) {
  const [tractors, setTractors] = useState<Tractor[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const { tractors } = await fetchTractors();
      setTractors(tractors);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = tractors.filter((t) =>
    `${t.plateNumber} ${t.brand} ${t.model}`.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) return <CenteredSpinner />;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Rechercher (plaque, marque, modèle)"
        placeholderTextColor={colors.textFaint}
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={filtered}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
        ListEmptyComponent={<EmptyState text="Aucun tracteur." />}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => navigation.navigate("TractorForm", { tractorId: item.id })}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>{item.plateNumber}</Text>
              <Text style={styles.rowSubtitle}>{item.brand} {item.model} · {item.mileage.toLocaleString("fr-FR")} km</Text>
            </View>
            <StatusBadge status={item.status} labels={tractorTrailerStatusLabels} />
          </Pressable>
        )}
      />
      <FAB onPress={() => navigation.navigate("TractorForm", {})} />
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
