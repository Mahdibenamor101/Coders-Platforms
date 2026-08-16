import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { createTrailer, deleteTrailer, fetchTrailer, updateTrailer, ApiError } from "../api/client";
import { colors } from "../theme";
import { CenteredSpinner, ErrorBanner, Field, PrimaryButton, SecondaryButton, SegmentedField } from "../components/ui";

type Props = NativeStackScreenProps<RootStackParamList, "TrailerForm">;

const STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "Disponible" },
  { value: "IN_USE", label: "En mission" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "OUT_OF_SERVICE", label: "Hors service" },
];

const TYPE_OPTIONS = [
  { value: "CURTAIN", label: "Bâchée" },
  { value: "REEFER", label: "Frigorifique" },
  { value: "FLATBED", label: "Plateau" },
  { value: "TANK", label: "Citerne" },
  { value: "CONTAINER", label: "Conteneur" },
  { value: "TIPPER", label: "Benne" },
];

export function TrailerFormScreen({ route, navigation }: Props) {
  const trailerId = route.params?.trailerId;
  const isEdit = Boolean(trailerId);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [plateNumber, setPlateNumber] = useState("");
  const [type, setType] = useState("CURTAIN");
  const [capacityTons, setCapacityTons] = useState("");
  const [status, setStatus] = useState("AVAILABLE");
  const [nextInspectionDate, setNextInspectionDate] = useState("");
  const [insuranceExpiry, setInsuranceExpiry] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    navigation.setOptions({ title: isEdit ? "Modifier la remorque" : "Nouvelle remorque" });
  }, [navigation, isEdit]);

  useEffect(() => {
    if (!trailerId) return;
    fetchTrailer(trailerId).then(({ trailer }) => {
      setPlateNumber(trailer.plateNumber);
      setType(trailer.type);
      setCapacityTons(trailer.capacityTons != null ? String(trailer.capacityTons) : "");
      setStatus(trailer.status);
      setNextInspectionDate(trailer.nextInspectionDate ? trailer.nextInspectionDate.slice(0, 10) : "");
      setInsuranceExpiry(trailer.insuranceExpiry ? trailer.insuranceExpiry.slice(0, 10) : "");
      setNotes(trailer.notes ?? "");
    }).catch(() => setError("Impossible de charger cette remorque.")).finally(() => setLoading(false));
  }, [trailerId]);

  async function handleSave() {
    if (!plateNumber) {
      setError("L'immatriculation est requise.");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      plateNumber,
      type,
      capacityTons: capacityTons ? Number(capacityTons) : undefined,
      status,
      nextInspectionDate,
      insuranceExpiry,
      notes,
    };
    try {
      if (isEdit && trailerId) await updateTrailer(trailerId, payload);
      else await createTrailer(payload);
      navigation.goBack();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!trailerId) return;
    Alert.alert("Supprimer cette remorque ?", "Cette action est irréversible.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          await deleteTrailer(trailerId);
          navigation.goBack();
        },
      },
    ]);
  }

  if (loading) return <CenteredSpinner />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {error && <ErrorBanner message={error} />}

      <Field label="Immatriculation" value={plateNumber} onChangeText={setPlateNumber} />
      <SegmentedField label="Type" options={TYPE_OPTIONS} value={type} onChange={setType} />
      <Field label="Capacité (tonnes)" keyboardType="numeric" value={capacityTons} onChangeText={setCapacityTons} />
      <SegmentedField label="Statut" options={STATUS_OPTIONS} value={status} onChange={setStatus} />
      <Field
        label="Prochaine inspection (AAAA-MM-JJ)"
        value={nextInspectionDate}
        onChangeText={setNextInspectionDate}
      />
      <Field label="Expiration assurance (AAAA-MM-JJ)" value={insuranceExpiry} onChangeText={setInsuranceExpiry} />
      <Field label="Notes" multiline numberOfLines={3} value={notes} onChangeText={setNotes} />

      <PrimaryButton title={isEdit ? "Enregistrer" : "Créer"} onPress={handleSave} loading={saving} />
      {isEdit && (
        <View style={styles.deleteWrap}>
          <SecondaryButton title="Supprimer cette remorque" onPress={handleDelete} danger />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  deleteWrap: { marginTop: 12 },
});
