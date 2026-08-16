import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { createTrip, fetchDrivers, fetchTractors, fetchTrailers, ApiError } from "../api/client";
import { colors } from "../theme";
import { CenteredSpinner, ErrorBanner, Field, PrimaryButton } from "../components/ui";
import { PickerField } from "../components/PickerField";
import type { Driver, Tractor, Trailer } from "../api/types";

type Props = NativeStackScreenProps<RootStackParamList, "TripForm">;

export function TripFormScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tractors, setTractors] = useState<Tractor[]>([]);
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  const [tractorId, setTractorId] = useState("");
  const [trailerId, setTrailerId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureAt, setDepartureAt] = useState("");
  const [cargoDescription, setCargoDescription] = useState("");
  const [notifyDriver, setNotifyDriver] = useState(true);

  useEffect(() => {
    Promise.all([fetchTractors(), fetchTrailers(), fetchDrivers()])
      .then(([t, tr, d]) => {
        setTractors(t.tractors.filter((x) => x.status === "AVAILABLE"));
        setTrailers(tr.trailers.filter((x) => x.status === "AVAILABLE"));
        setDrivers(d.drivers.filter((x) => x.status === "ACTIVE"));
      })
      .catch(() => setError("Impossible de charger les ressources."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!tractorId || !driverId || !origin || !destination || !departureAt) {
      setError("Tracteur, chauffeur, origine, destination et date de départ sont requis.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createTrip({
        tractorId,
        trailerId: trailerId || undefined,
        driverId,
        origin,
        destination,
        departureAt,
        cargoDescription,
        notifyDriver,
      });
      navigation.goBack();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Création impossible.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <CenteredSpinner />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {error && <ErrorBanner message={error} />}

      <PickerField
        label="Tracteur"
        value={tractorId}
        onChange={setTractorId}
        options={tractors.map((t) => ({ value: t.id, label: t.plateNumber, subtitle: `${t.brand} ${t.model}` }))}
      />
      <PickerField
        label="Remorque (optionnel)"
        value={trailerId}
        onChange={setTrailerId}
        options={trailers.map((t) => ({ value: t.id, label: t.plateNumber }))}
      />
      <PickerField
        label="Chauffeur"
        value={driverId}
        onChange={setDriverId}
        options={drivers.map((d) => ({ value: d.id, label: `${d.firstName} ${d.lastName}`, subtitle: d.phone }))}
      />
      <Field label="Origine" value={origin} onChangeText={setOrigin} />
      <Field label="Destination" value={destination} onChangeText={setDestination} />
      <Field
        label="Date/heure de départ (AAAA-MM-JJTHH:mm)"
        placeholder="2026-08-20T08:00"
        value={departureAt}
        onChangeText={setDepartureAt}
      />
      <Field label="Description du chargement" value={cargoDescription} onChangeText={setCargoDescription} />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Notifier le chauffeur par WhatsApp</Text>
        <Switch value={notifyDriver} onValueChange={setNotifyDriver} trackColor={{ true: colors.primary }} />
      </View>

      <PrimaryButton title="Créer la tournée" onPress={handleSave} loading={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingVertical: 4,
  },
  switchLabel: { fontSize: 13, fontWeight: "600", color: colors.text },
});
