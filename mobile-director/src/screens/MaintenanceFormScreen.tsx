import { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { createMaintenanceRecord, fetchTractors, fetchTrailers, ApiError } from "../api/client";
import { CenteredSpinner, ErrorBanner, Field, PrimaryButton, SegmentedField } from "../components/ui";
import { PickerField } from "../components/PickerField";
import type { Tractor, Trailer } from "../api/types";

type Props = NativeStackScreenProps<RootStackParamList, "MaintenanceForm">;

const TYPE_OPTIONS = [
  { value: "OIL_CHANGE", label: "Vidange" },
  { value: "TIRES", label: "Pneus" },
  { value: "BRAKES", label: "Freins" },
  { value: "INSPECTION", label: "Inspection" },
  { value: "REPAIR", label: "Réparation" },
  { value: "OTHER", label: "Autre" },
];

export function MaintenanceFormScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tractors, setTractors] = useState<Tractor[]>([]);
  const [trailers, setTrailers] = useState<Trailer[]>([]);

  const [tractorId, setTractorId] = useState("");
  const [trailerId, setTrailerId] = useState("");
  const [type, setType] = useState("OTHER");
  const [performedAt, setPerformedAt] = useState("");
  const [mileage, setMileage] = useState("");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");
  const [nextDueAt, setNextDueAt] = useState("");
  const [nextDueMileage, setNextDueMileage] = useState("");

  useEffect(() => {
    Promise.all([fetchTractors(), fetchTrailers()])
      .then(([t, tr]) => {
        setTractors(t.tractors);
        setTrailers(tr.trailers);
      })
      .catch(() => setError("Impossible de charger les véhicules."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if ((!tractorId && !trailerId) || !performedAt) {
      setError("Sélectionnez un véhicule et une date.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createMaintenanceRecord({
        tractorId: tractorId || undefined,
        trailerId: trailerId || undefined,
        type,
        performedAt,
        mileage: mileage ? Number(mileage) : undefined,
        cost: cost ? Number(cost) : undefined,
        notes,
        nextDueAt,
        nextDueMileage: nextDueMileage ? Number(nextDueMileage) : undefined,
      });
      navigation.goBack();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Enregistrement impossible.");
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
        onChange={(v) => { setTractorId(v); setTrailerId(""); }}
        options={tractors.map((t) => ({ value: t.id, label: t.plateNumber }))}
      />
      <PickerField
        label="Remorque"
        value={trailerId}
        onChange={(v) => { setTrailerId(v); setTractorId(""); }}
        options={trailers.map((t) => ({ value: t.id, label: t.plateNumber }))}
      />
      <SegmentedField label="Type" options={TYPE_OPTIONS} value={type} onChange={setType} />
      <Field label="Date de l'intervention (AAAA-MM-JJ)" value={performedAt} onChangeText={setPerformedAt} />
      <Field label="Kilométrage" keyboardType="numeric" value={mileage} onChangeText={setMileage} />
      <Field label="Coût (€)" keyboardType="numeric" value={cost} onChangeText={setCost} />
      <Field label="Prochaine échéance (AAAA-MM-JJ)" value={nextDueAt} onChangeText={setNextDueAt} />
      <Field label="Prochaine échéance (km)" keyboardType="numeric" value={nextDueMileage} onChangeText={setNextDueMileage} />
      <Field label="Notes" multiline numberOfLines={3} value={notes} onChangeText={setNotes} />

      <PrimaryButton title="Enregistrer" onPress={handleSave} loading={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6f8" },
  content: { padding: 16, paddingBottom: 40 },
});
