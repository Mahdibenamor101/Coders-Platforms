import { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/types";
import { fetchDashboard } from "../api/client";
import { clearSession, getSession } from "../storage/session";
import { colors, severityColors } from "../theme";
import { Card, CenteredSpinner, EmptyState, StatusBadge } from "../components/ui";
import type { DashboardData } from "../api/types";

type Props = NativeStackScreenProps<RootStackParamList, "Dashboard">;

const MENU: { label: string; icon: string; screen: keyof RootStackParamList }[] = [
  { label: "Tracteurs", icon: "🚚", screen: "Tractors" },
  { label: "Remorques", icon: "🚛", screen: "Trailers" },
  { label: "Chauffeurs", icon: "🧑‍✈️", screen: "Drivers" },
  { label: "Commandes", icon: "📦", screen: "Orders" },
  { label: "Tournées", icon: "🗺️", screen: "Trips" },
  { label: "Carte live", icon: "📍", screen: "Live" },
  { label: "Maintenance", icon: "🔧", screen: "Maintenance" },
  { label: "Recommandations", icon: "💡", screen: "Recommendations" },
  { label: "Paramètres", icon: "⚙️", screen: "Settings" },
];

export function DashboardScreen({ navigation }: Props) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    const session = await getSession();
    if (!session) {
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      return;
    }
    setCompanyName(session.user.companyName);
    setUserName(session.user.name);
    if (isRefresh) setRefreshing(true);
    try {
      const dashboard = await fetchDashboard();
      setData(dashboard);
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

  async function handleLogout() {
    await clearSession();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  }

  if (loading || !data) return <CenteredSpinner />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.company}>{companyName}</Text>
          <Text style={styles.greeting}>Bonjour {userName}</Text>
        </View>
        <Pressable onPress={handleLogout} hitSlop={10}>
          <Text style={styles.logout}>Déconnexion</Text>
        </Pressable>
      </View>

      <View style={styles.statsGrid}>
        <StatTile label="Tracteurs" value={data.stats.tractorCount} onPress={() => navigation.navigate("Tractors")} />
        <StatTile label="Remorques" value={data.stats.trailerCount} onPress={() => navigation.navigate("Trailers")} />
        <StatTile label="Chauffeurs" value={data.stats.driverCount} onPress={() => navigation.navigate("Drivers")} />
        <StatTile label="Missions actives" value={data.stats.activeTripCount} onPress={() => navigation.navigate("Trips")} />
      </View>

      <Text style={styles.sectionTitle}>Accès rapide</Text>
      <View style={styles.menuGrid}>
        {MENU.map((item) => (
          <Pressable key={item.screen} style={styles.menuTile} onPress={() => navigation.navigate(item.screen as never)}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Prochaines tournées</Text>
      {data.upcomingTrips.length === 0 ? (
        <EmptyState text="Aucune tournée à venir." />
      ) : (
        data.upcomingTrips.map((trip) => (
          <Card key={trip.id}>
            <View style={styles.rowBetween}>
              <Text style={styles.tripLine}>
                {trip.driver.firstName} {trip.driver.lastName} · {trip.tractor.plateNumber}
              </Text>
              <StatusBadge status={trip.status} labels={{ PLANNED: "Planifiée", IN_PROGRESS: "En cours" }} />
            </View>
            <Text style={styles.tripRoute}>{trip.origin} → {trip.destination}</Text>
          </Card>
        ))
      )}

      <Text style={styles.sectionTitle}>Recommandations</Text>
      {data.recommendations.length === 0 ? (
        <EmptyState text="Aucune recommandation en attente." />
      ) : (
        data.recommendations.map((rec) => {
          const c = severityColors[rec.severity] ?? severityColors.INFO;
          return (
            <Card key={rec.id}>
              <View style={styles.rowBetween}>
                <Text style={styles.recTitle}>{rec.title}</Text>
                <View style={[styles.severityDot, { backgroundColor: c.text }]} />
              </View>
              <Text style={styles.recMessage}>{rec.message}</Text>
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}

function StatTile({ label, value, onPress }: { label: string; value: number; onPress: () => void }) {
  return (
    <Pressable style={styles.statTile} onPress={onPress}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  company: { fontSize: 18, fontWeight: "800", color: colors.text },
  greeting: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  logout: { color: colors.primary, fontSize: 13, fontWeight: "600" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  statTile: {
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
  },
  statValue: { fontSize: 26, fontWeight: "800", color: colors.text },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: 10, marginTop: 8 },
  menuGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  menuTile: {
    flexBasis: "30%",
    flexGrow: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    gap: 6,
  },
  menuIcon: { fontSize: 22 },
  menuLabel: { fontSize: 11, color: colors.text, fontWeight: "600", textAlign: "center" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  tripLine: { fontSize: 13, fontWeight: "600", color: colors.text, flex: 1 },
  tripRoute: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  recTitle: { fontSize: 13, fontWeight: "600", color: colors.text, flex: 1 },
  recMessage: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  severityDot: { width: 8, height: 8, borderRadius: 4 },
});
