import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { fetchTrips, parsePersonalLink } from "../api/client";
import { saveSession } from "../storage/session";
import { colors } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    const parsed = parsePersonalLink(link);
    if (!parsed) {
      setError("Lien invalide. Collez le lien complet reçu de votre dispatcher.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await fetchTrips(parsed.baseUrl, parsed.token);
      await saveSession(parsed);
      navigation.reset({ index: 0, routes: [{ name: "Missions" }] });
    } catch {
      setError("Impossible de se connecter avec ce lien. Vérifiez qu'il est correct et à jour.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>
          LOGISTICS<Text style={styles.titleAccent}>@MAHDI</Text>
        </Text>
        <Text style={styles.subtitle}>Portail conducteur</Text>

        <Text style={styles.label}>Votre lien personnel</Text>
        <TextInput
          style={styles.input}
          placeholder="https://.../driver/votre-code"
          placeholderTextColor={colors.textFaint}
          autoCapitalize="none"
          autoCorrect={false}
          multiline
          value={link}
          onChangeText={setLink}
        />
        <Text style={styles.hint}>
          Demandez ce lien à votre dispatcher, ou retrouvez-le sur votre fiche chauffeur.
        </Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          style={[styles.button, (loading || !link) && styles.buttonDisabled]}
          onPress={handleConnect}
          disabled={loading || !link}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Se connecter</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
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
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },
  titleAccent: { color: colors.primary },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 24,
  },
  label: { fontSize: 13, fontWeight: "600", color: colors.text, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    minHeight: 44,
  },
  hint: { fontSize: 12, color: colors.textFaint, marginTop: 6 },
  error: {
    marginTop: 12,
    fontSize: 13,
    color: colors.danger,
    backgroundColor: colors.dangerBg,
    padding: 10,
    borderRadius: 8,
  },
  button: {
    marginTop: 20,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.white, fontWeight: "700", fontSize: 15 },
});
