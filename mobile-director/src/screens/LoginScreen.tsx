import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { loginRequest, ApiError } from "../api/client";
import { saveSession } from "../storage/session";
import { colors } from "../theme";
import { Field, PrimaryButton, ErrorBanner } from "../components/ui";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const [baseUrl, setBaseUrl] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    const trimmedUrl = baseUrl.trim().replace(/\/+$/, "");
    if (!trimmedUrl || !email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { token, user, company } = await loginRequest(trimmedUrl, email.trim(), password);
      await saveSession({
        token,
        baseUrl: trimmedUrl,
        user: { name: user.name, email: user.email, role: user.role, companyName: company.name },
      });
      navigation.reset({ index: 0, routes: [{ name: "Dashboard" }] });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Connexion impossible. Verifiez l'adresse du serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>
            LOGISTICS<Text style={styles.titleAccent}>@MAHDI</Text>
          </Text>
          <Text style={styles.subtitle}>Espace direction</Text>

          <Field
            label="Adresse du serveur"
            placeholder="https://votre-serveur.com"
            autoCapitalize="none"
            autoCorrect={false}
            value={baseUrl}
            onChangeText={setBaseUrl}
          />
          <Field
            label="Email"
            placeholder="vous@entreprise.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Field label="Mot de passe" secureTextEntry value={password} onChangeText={setPassword} />

          {error && <ErrorBanner message={error} />}

          <PrimaryButton title="Se connecter" onPress={handleLogin} loading={loading} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  title: { fontSize: 22, fontWeight: "800", color: colors.text, textAlign: "center" },
  titleAccent: { color: colors.primary },
  subtitle: { fontSize: 13, color: colors.textMuted, textAlign: "center", marginTop: 4, marginBottom: 24 },
});
