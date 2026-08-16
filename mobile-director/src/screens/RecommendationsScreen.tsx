import { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { fetchRecommendations, generateRecommendations, resolveRecommendation } from "../api/client";
import { colors, severityColors } from "../theme";
import { CenteredSpinner, EmptyState } from "../components/ui";
import type { Recommendation } from "../api/types";

const SEVERITY_LABELS: Record<string, string> = { CRITICAL: "Critique", WARNING: "Attention", INFO: "Info" };

export function RecommendationsScreen() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      await generateRecommendations();
      const { recommendations } = await fetchRecommendations();
      setRecommendations(recommendations.filter((r) => !r.resolved));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function handleResolve(id: string) {
    setRecommendations((prev) => prev.filter((r) => r.id !== id));
    await resolveRecommendation(id);
  }

  if (loading) return <CenteredSpinner />;

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.listContent}
      data={recommendations}
      keyExtractor={(r) => r.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
      ListEmptyComponent={<EmptyState text="Aucune recommandation en attente." />}
      renderItem={({ item }) => {
        const c = severityColors[item.severity] ?? severityColors.INFO;
        return (
          <View style={[styles.row, { borderLeftColor: c.text }]}>
            <View style={styles.rowTop}>
              <View style={[styles.severityBadge, { backgroundColor: c.bg }]}>
                <Text style={[styles.severityText, { color: c.text }]}>{SEVERITY_LABELS[item.severity] ?? item.severity}</Text>
              </View>
              <Text style={styles.entityLabel}>{item.entityLabel}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.message}>{item.message}</Text>
            <Pressable style={styles.resolveButton} onPress={() => handleResolve(item.id)}>
              <Text style={styles.resolveText}>Marquer comme résolu</Text>
            </Pressable>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  listContent: { padding: 16, paddingBottom: 40 },
  row: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 14,
    marginBottom: 10,
  },
  rowTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  severityBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  severityText: { fontSize: 11, fontWeight: "600" },
  entityLabel: { fontSize: 11, color: colors.textFaint, flex: 1 },
  title: { fontSize: 14, fontWeight: "700", color: colors.text },
  message: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  resolveButton: { marginTop: 10, alignSelf: "flex-start" },
  resolveText: { fontSize: 12, color: colors.primary, fontWeight: "600" },
});
