import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/types";
import { failOrder, fetchOrder, startOrder, submitPod, type OrderDetail } from "../api/client";
import { getSession } from "../storage/session";
import { colors, statusColors, statusLabels } from "../theme";
import { SignaturePad } from "../components/SignaturePad";
import { PhotoCapture } from "../components/PhotoCapture";
import { BarcodeScannerModal } from "../components/BarcodeScannerModal";

type Props = NativeStackScreenProps<RootStackParamList, "OrderDetail">;

export function OrderDetailScreen({ route, navigation }: Props) {
  const { orderId } = route.params;
  const [session, setSession] = useState<{ baseUrl: string; token: string } | null>(null);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [signature, setSignature] = useState("");
  const [notes, setNotes] = useState("");
  const [barcode, setBarcode] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [failReason, setFailReason] = useState("");

  const load = useCallback(async () => {
    const s = await getSession();
    if (!s) {
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      return;
    }
    setSession(s);
    try {
      const data = await fetchOrder(s.baseUrl, s.token, orderId);
      setOrder(data.order);
    } catch {
      setError("Impossible de charger cette commande.");
    } finally {
      setLoading(false);
    }
  }, [orderId, navigation]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleStart() {
    if (!session) return;
    setBusy(true);
    setError(null);
    try {
      const { order: updated } = await startOrder(session.baseUrl, session.token, orderId);
      setOrder(updated);
    } catch {
      setError("Impossible de démarrer cette livraison.");
    } finally {
      setBusy(false);
    }
  }

  async function handleFail() {
    if (!session) return;
    setBusy(true);
    setError(null);
    try {
      const { order: updated } = await failOrder(session.baseUrl, session.token, orderId, failReason);
      setOrder(updated);
    } catch {
      setError("Impossible de signaler cet échec.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmitPod() {
    if (!session) return;
    setBusy(true);
    setError(null);
    try {
      const { order: updated } = await submitPod(session.baseUrl, session.token, orderId, {
        podSignature: signature,
        podNotes: notes,
        podBarcode: barcode,
        photoUri,
      });
      setOrder(updated);
    } catch {
      setError("Impossible d'envoyer la preuve de livraison.");
    } finally {
      setBusy(false);
    }
  }

  if (loading || !order) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const badge = statusColors[order.status] ?? { bg: colors.border, text: colors.textMuted };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.reference}>{order.reference}</Text>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.text }]}>
              {statusLabels[order.status] ?? order.status}
            </Text>
          </View>
        </View>
        <Text style={styles.customer}>{order.customerName}</Text>
        {order.customerPhone && <Text style={styles.phone}>{order.customerPhone}</Text>}
        <View style={styles.addresses}>
          <Text style={styles.addressLine}>
            <Text style={styles.addressLabel}>Enlèvement : </Text>
            {order.pickupAddress}
          </Text>
          <Text style={styles.addressLine}>
            <Text style={styles.addressLabel}>Livraison : </Text>
            {order.deliveryAddress}
          </Text>
        </View>
        {order.hazmat && (
          <Text style={styles.hazmat}>⚠ Matière dangereuse - suivre les procédures ADR</Text>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {order.status === "ASSIGNED" && (
        <Pressable style={[styles.primaryButton, busy && styles.disabled]} onPress={handleStart} disabled={busy}>
          <Text style={styles.primaryButtonText}>
            {busy ? "Démarrage..." : "Démarrer cette livraison"}
          </Text>
        </Pressable>
      )}

      {order.status === "IN_PROGRESS" && (
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.label}>Signature du client</Text>
            <SignaturePad onChange={setSignature} />

            <Text style={[styles.label, styles.mt]}>Photo de livraison</Text>
            <PhotoCapture photoUri={photoUri} onChange={setPhotoUri} />

            <Text style={[styles.label, styles.mt]}>Code-barres</Text>
            <Pressable style={styles.scanButton} onPress={() => setScannerOpen(true)}>
              <Text style={styles.scanButtonText}>📷 Scanner un code-barres</Text>
            </Pressable>
            <TextInput
              style={[styles.input, styles.mt]}
              placeholder="Ou saisir manuellement"
              placeholderTextColor={colors.textFaint}
              value={barcode}
              onChangeText={setBarcode}
            />

            <Text style={[styles.label, styles.mt]}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
            />

            <Pressable
              style={[styles.primaryButton, styles.mt, busy && styles.disabled]}
              onPress={handleSubmitPod}
              disabled={busy}
            >
              <Text style={styles.primaryButtonText}>
                {busy ? "Envoi..." : "Confirmer la livraison"}
              </Text>
            </Pressable>
          </View>

          <View style={[styles.card, styles.mt]}>
            <Text style={styles.label}>Signaler un problème (livraison impossible)</Text>
            <TextInput
              style={[styles.input, styles.textarea, styles.mt]}
              multiline
              numberOfLines={2}
              placeholder="Raison"
              placeholderTextColor={colors.textFaint}
              value={failReason}
              onChangeText={setFailReason}
            />
            <Pressable
              style={[styles.dangerButton, styles.mt, busy && styles.disabled]}
              onPress={handleFail}
              disabled={busy}
            >
              <Text style={styles.dangerButtonText}>Marquer comme échouée</Text>
            </Pressable>
          </View>
        </View>
      )}

      {(order.status === "DELIVERED" || order.status === "FAILED") && (
        <View style={styles.card}>
          <Text style={styles.finalText}>
            {order.status === "DELIVERED"
              ? `Livrée le ${order.deliveredAt ? new Date(order.deliveredAt).toLocaleString("fr-FR") : ""}`
              : `Échec de livraison : ${order.podNotes ?? "aucun détail"}`}
          </Text>
        </View>
      )}

      <BarcodeScannerModal
        visible={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanned={setBarcode}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  reference: { fontSize: 17, fontWeight: "700", color: colors.text },
  customer: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  phone: { fontSize: 13, color: colors.textFaint },
  addresses: { marginTop: 10, gap: 4 },
  addressLine: { fontSize: 13, color: colors.text },
  addressLabel: { color: colors.textFaint },
  hazmat: { marginTop: 10, fontSize: 12, fontWeight: "600", color: colors.danger },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: "600" },
  error: {
    fontSize: 13,
    color: colors.danger,
    backgroundColor: colors.dangerBg,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  section: { gap: 0 },
  label: { fontSize: 13, fontWeight: "600", color: colors.text, marginBottom: 6 },
  mt: { marginTop: 14 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  textarea: { minHeight: 70, textAlignVertical: "top" },
  scanButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: colors.white,
  },
  scanButtonText: { fontSize: 14, color: colors.text, fontWeight: "600" },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  primaryButtonText: { color: colors.white, fontWeight: "700", fontSize: 14 },
  dangerButton: {
    backgroundColor: colors.danger,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  dangerButtonText: { color: colors.white, fontWeight: "700", fontSize: 14 },
  disabled: { opacity: 0.6 },
  finalText: { fontSize: 14, color: colors.text },
});
