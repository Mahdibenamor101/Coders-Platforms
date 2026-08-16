import { useCallback, useState } from "react";
import { Alert, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/types";
import { deleteDriver, fetchDriver, sendDriverLink } from "../api/client";
import { colors, driverStatusLabels } from "../theme";
import { Card, CenteredSpinner, PrimaryButton, SecondaryButton, StatusBadge } from "../components/ui";
import type { Driver } from "../api/types";

type Props = NativeStackScreenProps<RootStackParamList, "DriverDetail">;

export function DriverDetailScreen({ route, navigation }: Props) {
  const { driverId } = route.params;
  const [driver, setDriver] = useState<Driver | null>(null);
  const [portalLink, setPortalLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const { driver, portalLink } = await fetchDriver(driverId);
    setDriver(driver);
    setPortalLink(portalLink);
    setLoading(false);
  }, [driverId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function handleSendLink() {
    setSending(true);
    try {
      await sendDriverLink(driverId);
      Alert.alert("Lien envoyé", "Le lien du portail a été envoyé par WhatsApp.");
    } catch {
      Alert.alert("Erreur", "Impossible d'envoyer le lien.");
    } finally {
      setSending(false);
    }
  }

  function handleShareLink() {
    Share.share({ message: portalLink });
  }

  function handleDelete() {
    Alert.alert("Supprimer ce chauffeur ?", "Cette action est irréversible.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          await deleteDriver(driverId);
          navigation.goBack();
        },
      },
    ]);
  }

  if (loading || !driver) return <CenteredSpinner />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <View style={styles.rowBetween}>
          <Text style={styles.name}>{driver.firstName} {driver.lastName}</Text>
          <StatusBadge status={driver.status} labels={driverStatusLabels} />
        </View>
        <Text style={styles.line}>{driver.phone}</Text>
        <Text style={styles.line}>Permis {driver.licenseNumber} · expire le {driver.licenseExpiry.slice(0, 10)}</Text>
        {driver.skills && <Text style={styles.line}>Compétences : {driver.skills}</Text>}
        {driver.costPerKm != null && <Text style={styles.line}>Coût/km : {driver.costPerKm} €</Text>}
        {driver.notes && <Text style={styles.notes}>{driver.notes}</Text>}
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Portail conducteur</Text>
        <Text style={styles.link} numberOfLines={2}>{portalLink}</Text>
        <View style={styles.buttonRow}>
          <View style={styles.buttonHalf}>
            <SecondaryButton title="Partager le lien" onPress={handleShareLink} />
          </View>
          <View style={styles.buttonHalf}>
            <PrimaryButton title="Envoyer par WhatsApp" onPress={handleSendLink} loading={sending} />
          </View>
        </View>
      </Card>

      <PrimaryButton title="Modifier" onPress={() => navigation.navigate("DriverForm", { driverId })} />
      <View style={styles.deleteWrap}>
        <SecondaryButton title="Supprimer ce chauffeur" onPress={handleDelete} danger />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  name: { fontSize: 17, fontWeight: "700", color: colors.text },
  line: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  notes: { fontSize: 13, color: colors.text, marginTop: 8 },
  cardTitle: { fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 8 },
  link: { fontSize: 12, color: colors.primary, marginBottom: 12 },
  buttonRow: { flexDirection: "row", gap: 10 },
  buttonHalf: { flex: 1 },
  deleteWrap: { marginTop: 12 },
});
