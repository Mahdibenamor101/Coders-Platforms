import { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { createDriver, fetchDriver, updateDriver, ApiError } from "../api/client";
import { colors } from "../theme";
import { CenteredSpinner, ErrorBanner, Field, PrimaryButton, SegmentedField } from "../components/ui";

type Props = NativeStackScreenProps<RootStackParamList, "DriverForm">;

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Actif" },
  { value: "ON_LEAVE", label: "En congé" },
  { value: "SUSPENDED", label: "Suspendu" },
];

export function DriverFormScreen({ route, navigation }: Props) {
  const driverId = route.params?.driverId;
  const isEdit = Boolean(driverId);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [hireDate, setHireDate] = useState("");
  const [skills, setSkills] = useState("");
  const [costPerKm, setCostPerKm] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    navigation.setOptions({ title: isEdit ? "Modifier le chauffeur" : "Nouveau chauffeur" });
  }, [navigation, isEdit]);

  useEffect(() => {
    if (!driverId) return;
    fetchDriver(driverId).then(({ driver }) => {
      setFirstName(driver.firstName);
      setLastName(driver.lastName);
      setPhone(driver.phone);
      setLicenseNumber(driver.licenseNumber);
      setLicenseExpiry(driver.licenseExpiry.slice(0, 10));
      setStatus(driver.status);
      setHireDate(driver.hireDate ? driver.hireDate.slice(0, 10) : "");
      setSkills(driver.skills ?? "");
      setCostPerKm(driver.costPerKm != null ? String(driver.costPerKm) : "");
      setNotes(driver.notes ?? "");
    }).catch(() => setError("Impossible de charger ce chauffeur.")).finally(() => setLoading(false));
  }, [driverId]);

  async function handleSave() {
    if (!firstName || !lastName || !phone || !licenseNumber || !licenseExpiry) {
      setError("Prénom, nom, téléphone, permis et expiration sont requis.");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      firstName,
      lastName,
      phone,
      licenseNumber,
      licenseExpiry,
      status,
      hireDate,
      skills,
      costPerKm: costPerKm ? Number(costPerKm) : undefined,
      notes,
    };
    try {
      if (isEdit && driverId) await updateDriver(driverId, payload);
      else await createDriver(payload);
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

      <Field label="Prénom" value={firstName} onChangeText={setFirstName} />
      <Field label="Nom" value={lastName} onChangeText={setLastName} />
      <Field label="Téléphone" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <Field label="Numéro de permis" value={licenseNumber} onChangeText={setLicenseNumber} />
      <Field label="Expiration du permis (AAAA-MM-JJ)" value={licenseExpiry} onChangeText={setLicenseExpiry} />
      <SegmentedField label="Statut" options={STATUS_OPTIONS} value={status} onChange={setStatus} />
      <Field label="Date d'embauche (AAAA-MM-JJ)" value={hireDate} onChangeText={setHireDate} />
      <Field label="Compétences (séparées par virgule)" value={skills} onChangeText={setSkills} />
      <Field label="Coût par km" keyboardType="numeric" value={costPerKm} onChangeText={setCostPerKm} />
      <Field label="Notes" multiline numberOfLines={3} value={notes} onChangeText={setNotes} />

      <PrimaryButton title={isEdit ? "Enregistrer" : "Créer"} onPress={handleSave} loading={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
});
