import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { createTractor, deleteTractor, fetchTractor, updateTractor, ApiError } from "../api/client";
import { colors } from "../theme";
import { CenteredSpinner, ErrorBanner, Field, PrimaryButton, SecondaryButton, SegmentedField } from "../components/ui";

type Props = NativeStackScreenProps<RootStackParamList, "TractorForm">;

const STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "Disponible" },
  { value: "IN_USE", label: "En mission" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "OUT_OF_SERVICE", label: "Hors service" },
];

export function TractorFormScreen({ route, navigation }: Props) {
  const tractorId = route.params?.tractorId;
  const isEdit = Boolean(tractorId);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [plateNumber, setPlateNumber] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("0");
  const [status, setStatus] = useState("AVAILABLE");
  const [nextMaintenanceMileage, setNextMaintenanceMileage] = useState("");
  const [insuranceExpiry, setInsuranceExpiry] = useState("");
  const [technicalControlExpiry, setTechnicalControlExpiry] = useState("");
  const [costPerKm, setCostPerKm] = useState("");
  const [hazmatCertified, setHazmatCertified] = useState(false);
  const [fuelLevelPercent, setFuelLevelPercent] = useState("");
  const [adBlueLevelPercent, setAdBlueLevelPercent] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    navigation.setOptions({ title: isEdit ? "Modifier le tracteur" : "Nouveau tracteur" });
  }, [navigation, isEdit]);

  useEffect(() => {
    if (!tractorId) return;
    fetchTractor(tractorId).then(({ tractor }) => {
      setPlateNumber(tractor.plateNumber);
      setBrand(tractor.brand);
      setModel(tractor.model);
      setYear(tractor.year ? String(tractor.year) : "");
      setMileage(String(tractor.mileage));
      setStatus(tractor.status);
      setNextMaintenanceMileage(tractor.nextMaintenanceMileage ? String(tractor.nextMaintenanceMileage) : "");
      setInsuranceExpiry(tractor.insuranceExpiry ? tractor.insuranceExpiry.slice(0, 10) : "");
      setTechnicalControlExpiry(tractor.technicalControlExpiry ? tractor.technicalControlExpiry.slice(0, 10) : "");
      setCostPerKm(tractor.costPerKm != null ? String(tractor.costPerKm) : "");
      setHazmatCertified(tractor.hazmatCertified);
      setFuelLevelPercent(tractor.fuelLevelPercent != null ? String(tractor.fuelLevelPercent) : "");
      setAdBlueLevelPercent(tractor.adBlueLevelPercent != null ? String(tractor.adBlueLevelPercent) : "");
      setNotes(tractor.notes ?? "");
    }).catch(() => setError("Impossible de charger ce tracteur.")).finally(() => setLoading(false));
  }, [tractorId]);

  async function handleSave() {
    if (!plateNumber || !brand || !model) {
      setError("Immatriculation, marque et modèle sont requis.");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      plateNumber,
      brand,
      model,
      year: year ? Number(year) : undefined,
      mileage: Number(mileage) || 0,
      status,
      nextMaintenanceMileage: nextMaintenanceMileage ? Number(nextMaintenanceMileage) : undefined,
      insuranceExpiry,
      technicalControlExpiry,
      costPerKm: costPerKm ? Number(costPerKm) : undefined,
      hazmatCertified,
      fuelLevelPercent: fuelLevelPercent ? Number(fuelLevelPercent) : undefined,
      adBlueLevelPercent: adBlueLevelPercent ? Number(adBlueLevelPercent) : undefined,
      notes,
    };
    try {
      if (isEdit && tractorId) await updateTractor(tractorId, payload);
      else await createTractor(payload);
      navigation.goBack();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!tractorId) return;
    Alert.alert("Supprimer ce tracteur ?", "Cette action est irréversible.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          await deleteTractor(tractorId);
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
      <Field label="Marque" value={brand} onChangeText={setBrand} />
      <Field label="Modèle" value={model} onChangeText={setModel} />
      <Field label="Année" keyboardType="numeric" value={year} onChangeText={setYear} />
      <Field label="Kilométrage" keyboardType="numeric" value={mileage} onChangeText={setMileage} />
      <SegmentedField label="Statut" options={STATUS_OPTIONS} value={status} onChange={setStatus} />
      <Field
        label="Prochain entretien (km)"
        keyboardType="numeric"
        value={nextMaintenanceMileage}
        onChangeText={setNextMaintenanceMileage}
      />
      <Field label="Expiration assurance (AAAA-MM-JJ)" value={insuranceExpiry} onChangeText={setInsuranceExpiry} />
      <Field
        label="Expiration contrôle technique (AAAA-MM-JJ)"
        value={technicalControlExpiry}
        onChangeText={setTechnicalControlExpiry}
      />
      <Field label="Coût par km" keyboardType="numeric" value={costPerKm} onChangeText={setCostPerKm} />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Certifié matières dangereuses</Text>
        <Switch value={hazmatCertified} onValueChange={setHazmatCertified} trackColor={{ true: colors.primary }} />
      </View>

      <Field label="Niveau carburant (%)" keyboardType="numeric" value={fuelLevelPercent} onChangeText={setFuelLevelPercent} />
      <Field label="Niveau AdBlue (%)" keyboardType="numeric" value={adBlueLevelPercent} onChangeText={setAdBlueLevelPercent} />
      <Field label="Notes" multiline numberOfLines={3} value={notes} onChangeText={setNotes} />

      <PrimaryButton title={isEdit ? "Enregistrer" : "Créer"} onPress={handleSave} loading={saving} />
      {isEdit && (
        <View style={styles.deleteWrap}>
          <SecondaryButton title="Supprimer ce tracteur" onPress={handleDelete} danger />
        </View>
      )}
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
  deleteWrap: { marginTop: 12 },
});
