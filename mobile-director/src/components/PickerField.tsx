import { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../theme";

export type PickerOption = { value: string; label: string; subtitle?: string };

export function PickerField({
  label,
  value,
  options,
  onChange,
  placeholder = "Sélectionner...",
}: {
  label: string;
  value: string;
  options: PickerOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((o) => o.value === value);
  const filtered = options.filter((o) => `${o.label} ${o.subtitle ?? ""}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.field} onPress={() => setOpen(true)}>
        <Text style={selected ? styles.value : styles.placeholder}>{selected ? selected.label : placeholder}</Text>
      </Pressable>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.modal}>
          <TextInput
            style={styles.search}
            placeholder="Rechercher..."
            placeholderTextColor={colors.textFaint}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          <FlatList
            data={filtered}
            keyExtractor={(o) => o.value}
            renderItem={({ item }) => (
              <Pressable
                style={styles.option}
                onPress={() => {
                  onChange(item.value);
                  setOpen(false);
                  setQuery("");
                }}
              >
                <Text style={styles.optionLabel}>{item.label}</Text>
                {item.subtitle && <Text style={styles.optionSubtitle}>{item.subtitle}</Text>}
              </Pressable>
            )}
            ListEmptyComponent={<Text style={styles.empty}>Aucun résultat.</Text>}
          />
          <Pressable style={styles.close} onPress={() => setOpen(false)}>
            <Text style={styles.closeText}>Fermer</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "600", color: colors.text, marginBottom: 6 },
  field: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  value: { fontSize: 14, color: colors.text },
  placeholder: { fontSize: 14, color: colors.textFaint },
  modal: { flex: 1, backgroundColor: colors.bg, paddingTop: 60, paddingHorizontal: 16 },
  search: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: colors.white,
    color: colors.text,
    marginBottom: 12,
  },
  option: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  optionLabel: { fontSize: 14, fontWeight: "600", color: colors.text },
  optionSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  empty: { textAlign: "center", color: colors.textMuted, marginTop: 20 },
  close: { paddingVertical: 16, alignItems: "center" },
  closeText: { color: colors.primary, fontWeight: "600", fontSize: 14 },
});
