import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { fetchSettings, sendTestWhatsApp, updateSettings, ApiError } from "../api/client";
import { getSession } from "../storage/session";
import { colors } from "../theme";
import { CenteredSpinner, Card, ErrorBanner, Field, PrimaryButton, SecondaryButton } from "../components/ui";

export function SettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [whatsappPhoneNumberId, setWhatsappPhoneNumberId] = useState("");
  const [whatsappAccessToken, setWhatsappAccessToken] = useState("");
  const [whatsappTestRecipient, setWhatsappTestRecipient] = useState("");
  const [depotAddress, setDepotAddress] = useState("");
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    Promise.all([fetchSettings(), getSession()])
      .then(([{ company }, session]) => {
        setCompanyName(company.name);
        setWhatsappPhoneNumberId(company.whatsappPhoneNumberId ?? "");
        setWhatsappAccessToken(company.whatsappAccessToken ?? "");
        setWhatsappTestRecipient(company.whatsappTestRecipient ?? "");
        setDepotAddress(company.depotAddress ?? "");
        if (session) setUserInfo(session.user);
      })
      .catch(() => setError("Impossible de charger les paramètres."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!companyName) {
      setError("Le nom de l'entreprise est requis.");
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateSettings({
        companyName,
        whatsappPhoneNumberId,
        whatsappAccessToken,
        whatsappTestRecipient,
        depotAddress,
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  }

  async function handleTestWhatsApp() {
    setTesting(true);
    try {
      await sendTestWhatsApp();
      Alert.alert("Envoyé", "Le message de test a été envoyé.");
    } catch (err) {
      Alert.alert("Erreur", err instanceof ApiError ? err.message : "Envoi impossible.");
    } finally {
      setTesting(false);
    }
  }

  if (loading) return <CenteredSpinner />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {userInfo && (
        <Card>
          <Text style={styles.cardTitle}>Compte</Text>
          <Text style={styles.line}>{userInfo.name} · {userInfo.email}</Text>
          <Text style={styles.line}>{userInfo.role === "ADMIN" ? "Administrateur" : "Dispatcher"}</Text>
        </Card>
      )}

      {error && <ErrorBanner message={error} />}
      {saved && <Text style={styles.savedText}>Paramètres enregistrés.</Text>}

      <Field label="Nom de l'entreprise" value={companyName} onChangeText={setCompanyName} />
      <Field label="Adresse du dépôt" value={depotAddress} onChangeText={setDepotAddress} />
      <Field label="WhatsApp Phone Number ID" value={whatsappPhoneNumberId} onChangeText={setWhatsappPhoneNumberId} />
      <Field label="WhatsApp Access Token" secureTextEntry value={whatsappAccessToken} onChangeText={setWhatsappAccessToken} />
      <Field label="Destinataire de test WhatsApp" value={whatsappTestRecipient} onChangeText={setWhatsappTestRecipient} />

      <PrimaryButton title="Enregistrer" onPress={handleSave} loading={saving} />
      <SecondaryButton title="Envoyer un message de test" onPress={handleTestWhatsApp} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40, gap: 12 },
  cardTitle: { fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 6 },
  line: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  savedText: { fontSize: 13, color: colors.primary, marginBottom: 4 },
});
