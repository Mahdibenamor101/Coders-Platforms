import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/types";
import { deleteTrip, fetchTrip, notifyTripDriver, updateTripStatus, ApiError } from "../api/client";
import { colors, orderStatusLabels, tripStatusLabels } from "../theme";
import { Card, CenteredSpinner, PrimaryButton, SecondaryButton, SegmentedField, StatusBadge } from "../components/ui";
import type { Trip } from "../api/types";

type Props = NativeStackScreenProps<RootStackParamList, "TripDetail">;

const STATUS_OPTIONS = [
  { value: "PLANNED", label: "Planifiée" },
  { value: "IN_PROGRESS", label: "En cours" },
  { value: "COMPLETED", label: "Terminée" },
  { value: "CANCELLED", label: "Annulée" },
];

export function TripDetailScreen({ route, navigation }: Props) {
  const { tripId } = route.params;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifying, setNotifying] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const load = useCallback(async () => {
    const { trip } = await fetchTrip(tripId);
    setTrip(trip);
    setLoading(false);
  }, [tripId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function handleStatusChange(status: string) {
    if (!trip || status === trip.status) return;
    setUpdatingStatus(true);
    try {
      await updateTripStatus(tripId, status as Trip["status"]);
      await load();
    } catch (err) {
      Alert.alert("Erreur", err instanceof ApiError ? err.message : "Changement de statut impossible.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleNotify() {
    setNotifying(true);
    try {
      await notifyTripDriver(tripId);
      Alert.alert("Notifié", "Le chauffeur a été notifié par WhatsApp.");
      load();
    } catch {
      Alert.alert("Erreur", "Impossible de notifier le chauffeur.");
    } finally {
      setNotifying(false);
    }
  }

  function handleDelete() {
    Alert.alert("Supprimer cette tournée ?", "Cette action est irréversible.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          await deleteTrip(tripId);
          navigation.goBack();
        },
      },
    ]);
  }

  if (loading || !trip) return <CenteredSpinner />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <View style={styles.rowBetween}>
          <Text style={styles.title}>{trip.driver.firstName} {trip.driver.lastName}</Text>
          <StatusBadge status={trip.status} labels={tripStatusLabels} />
        </View>
        <Text style={styles.line}>{trip.tractor.plateNumber}{trip.trailer ? ` / ${trip.trailer.plateNumber}` : ""}</Text>
        <Text style={styles.line}>{trip.origin} → {trip.destination}</Text>
        <Text style={styles.line}>Départ : {new Date(trip.departureAt).toLocaleString("fr-FR")}</Text>
        {trip.distanceKm != null && <Text style={styles.line}>{trip.distanceKm.toFixed(0)} km</Text>}
        {trip.cargoDescription && <Text style={styles.line}>Cargaison : {trip.cargoDescription}</Text>}
        <Text style={styles.line}>
          {trip.driverNotifiedAt ? "Chauffeur notifié" : "Chauffeur non notifié"}
        </Text>
      </Card>

      <Card>
        <SegmentedField label="Statut" options={STATUS_OPTIONS} value={trip.status} onChange={handleStatusChange} />
        {updatingStatus && <Text style={styles.hint}>Mise à jour...</Text>}
      </Card>

      <Text style={styles.sectionTitle}>Arrêts ({trip.orders?.length ?? 0})</Text>
      {(trip.orders ?? []).length === 0 ? (
        <Card><Text style={styles.line}>Aucun arrêt assigné.</Text></Card>
      ) : (
        trip.orders?.map((order, idx) => (
          <Card key={order.id}>
            <View style={styles.rowBetween}>
              <Text style={styles.orderLine}>{idx + 1}. {order.customerName} - {order.deliveryAddress}</Text>
              <StatusBadge status={order.status} labels={orderStatusLabels} />
            </View>
          </Card>
        ))
      )}

      <PrimaryButton title="Notifier le chauffeur (WhatsApp)" onPress={handleNotify} loading={notifying} />
      <View style={styles.deleteWrap}>
        <SecondaryButton title="Supprimer cette tournée" onPress={handleDelete} danger />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  title: { fontSize: 17, fontWeight: "700", color: colors.text },
  line: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  hint: { fontSize: 12, color: colors.textFaint, marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: 8, marginTop: 4 },
  orderLine: { fontSize: 13, color: colors.text, flex: 1 },
  deleteWrap: { marginTop: 12 },
});
