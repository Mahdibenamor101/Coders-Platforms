import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { createOrder, fetchOrder, updateOrder, ApiError } from "../api/client";
import { colors } from "../theme";
import { CenteredSpinner, ErrorBanner, Field, PrimaryButton, SegmentedField } from "../components/ui";

type Props = NativeStackScreenProps<RootStackParamList, "OrderForm">;

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Basse" },
  { value: "MEDIUM", label: "Moyenne" },
  { value: "HIGH", label: "Haute" },
  { value: "URGENT", label: "Urgente" },
];

export function OrderFormScreen({ route, navigation }: Props) {
  const orderId = route.params?.orderId;
  const isEdit = Boolean(orderId);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [reference, setReference] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [hazmat, setHazmat] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: isEdit ? "Modifier la commande" : "Nouvelle commande" });
  }, [navigation, isEdit]);

  useEffect(() => {
    if (!orderId) return;
    fetchOrder(orderId).then(({ order }) => {
      setReference(order.reference);
      setCustomerName(order.customerName);
      setCustomerPhone(order.customerPhone ?? "");
      setPickupAddress(order.pickupAddress);
      setDeliveryAddress(order.deliveryAddress);
      setPriority(order.priority);
      setRequiredSkills(order.requiredSkills ?? "");
      setWeightKg(order.weightKg != null ? String(order.weightKg) : "");
      setHazmat(order.hazmat);
    }).catch(() => setError("Impossible de charger cette commande.")).finally(() => setLoading(false));
  }, [orderId]);

  async function handleSave() {
    if (!customerName || !pickupAddress || !deliveryAddress) {
      setError("Client, adresse d'enlèvement et de livraison sont requis.");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      reference,
      customerName,
      customerPhone,
      pickupAddress,
      deliveryAddress,
      priority,
      requiredSkills,
      weightKg: weightKg ? Number(weightKg) : undefined,
      hazmat,
    };
    try {
      if (isEdit && orderId) await updateOrder(orderId, payload);
      else await createOrder(payload);
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

      <Field label="Référence (laisser vide pour auto)" value={reference} onChangeText={setReference} />
      <Field label="Nom du client" value={customerName} onChangeText={setCustomerName} />
      <Field label="Téléphone du client" keyboardType="phone-pad" value={customerPhone} onChangeText={setCustomerPhone} />
      <Field label="Adresse d'enlèvement" value={pickupAddress} onChangeText={setPickupAddress} />
      <Field label="Adresse de livraison" value={deliveryAddress} onChangeText={setDeliveryAddress} />
      <SegmentedField label="Priorité" options={PRIORITY_OPTIONS} value={priority} onChange={setPriority} />
      <Field label="Compétences requises (séparées par virgule)" value={requiredSkills} onChangeText={setRequiredSkills} />
      <Field label="Poids (kg)" keyboardType="numeric" value={weightKg} onChangeText={setWeightKg} />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Matière dangereuse</Text>
        <Switch value={hazmat} onValueChange={setHazmat} trackColor={{ true: colors.primary }} />
      </View>

      <PrimaryButton title={isEdit ? "Enregistrer" : "Créer"} onPress={handleSave} loading={saving} />
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
