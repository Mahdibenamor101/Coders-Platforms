import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/types";
import { deleteOrder, fetchOrder, unassignOrder } from "../api/client";
import { colors, orderStatusLabels, priorityLabels } from "../theme";
import { Card, CenteredSpinner, PrimaryButton, SecondaryButton, StatusBadge } from "../components/ui";
import type { OrderSummary } from "../api/types";

type Props = NativeStackScreenProps<RootStackParamList, "OrderDetail">;

export function OrderDetailScreen({ route, navigation }: Props) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { order } = await fetchOrder(orderId);
    setOrder(order);
    setLoading(false);
  }, [orderId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  function handleUnassign() {
    Alert.alert("Détacher de la tournée ?", "La commande redeviendra en attente.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Détacher",
        onPress: async () => {
          await unassignOrder(orderId);
          load();
        },
      },
    ]);
  }

  function handleDelete() {
    Alert.alert("Supprimer cette commande ?", "Cette action est irréversible.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          await deleteOrder(orderId);
          navigation.goBack();
        },
      },
    ]);
  }

  if (loading || !order) return <CenteredSpinner />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <View style={styles.rowBetween}>
          <Text style={styles.title}>{order.reference}</Text>
          <StatusBadge status={order.status} labels={orderStatusLabels} />
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.client}>{order.customerName}</Text>
          <StatusBadge status={order.priority} labels={priorityLabels} />
        </View>
        {order.customerPhone && <Text style={styles.line}>{order.customerPhone}</Text>}
        <View style={styles.addresses}>
          <Text style={styles.line}><Text style={styles.label}>Enlèvement : </Text>{order.pickupAddress}</Text>
          <Text style={styles.line}><Text style={styles.label}>Livraison : </Text>{order.deliveryAddress}</Text>
        </View>
        {order.weightKg != null && <Text style={styles.line}>Poids : {order.weightKg} kg</Text>}
        {order.requiredSkills && <Text style={styles.line}>Compétences requises : {order.requiredSkills}</Text>}
        {order.hazmat && <Text style={styles.hazmat}>⚠ Matière dangereuse</Text>}
        {order.status === "DELIVERED" && order.deliveredAt && (
          <Text style={styles.line}>Livrée le {order.deliveredAt.slice(0, 10)}</Text>
        )}
        {order.status === "FAILED" && order.podNotes && (
          <Text style={styles.line}>Motif d'échec : {order.podNotes}</Text>
        )}
      </Card>

      <PrimaryButton title="Modifier" onPress={() => navigation.navigate("OrderForm", { orderId })} />
      {order.tripId && (
        <View style={styles.actionWrap}>
          <SecondaryButton title="Détacher de la tournée" onPress={handleUnassign} />
        </View>
      )}
      <View style={styles.actionWrap}>
        <SecondaryButton title="Supprimer cette commande" onPress={handleDelete} danger />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  title: { fontSize: 17, fontWeight: "700", color: colors.text },
  client: { fontSize: 14, color: colors.textMuted },
  line: { fontSize: 13, color: colors.text, marginTop: 4 },
  label: { color: colors.textFaint },
  addresses: { marginTop: 8, gap: 2 },
  hazmat: { marginTop: 8, fontSize: 12, fontWeight: "600", color: colors.danger },
  actionWrap: { marginTop: 12 },
});
