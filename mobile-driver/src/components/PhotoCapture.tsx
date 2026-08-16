import { useRef, useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { colors } from "../theme";

export function PhotoCapture({
  photoUri,
  onChange,
}: {
  photoUri: string | null;
  onChange: (uri: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  async function takePhoto() {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.6 });
    if (photo?.uri) {
      onChange(photo.uri);
      setOpen(false);
    }
  }

  return (
    <View>
      {photoUri ? (
        <View style={styles.previewWrap}>
          <Image source={{ uri: photoUri }} style={styles.preview} />
          <Pressable style={styles.retakeButton} onPress={() => setOpen(true)}>
            <Text style={styles.retakeText}>Reprendre</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.captureButton} onPress={() => setOpen(true)}>
          <Text style={styles.captureButtonText}>📷 Prendre une photo</Text>
        </Pressable>
      )}

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.modalContainer}>
          {!permission?.granted ? (
            <View style={styles.center}>
              <Text style={styles.message}>Autorisez la caméra pour photographier la livraison.</Text>
              <Pressable style={styles.permButton} onPress={requestPermission}>
                <Text style={styles.permButtonText}>Autoriser</Text>
              </Pressable>
            </View>
          ) : (
            <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
          )}
          <View style={styles.controls}>
            <Pressable style={styles.cancelButton} onPress={() => setOpen(false)}>
              <Text style={styles.cancelText}>Annuler</Text>
            </Pressable>
            {permission?.granted && (
              <Pressable style={styles.shutterButton} onPress={takePhoto}>
                <View style={styles.shutterInner} />
              </Pressable>
            )}
            <View style={styles.cancelButton} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  previewWrap: { alignItems: "flex-start" },
  preview: { width: "100%", height: 180, borderRadius: 10, backgroundColor: "#000" },
  retakeButton: { marginTop: 8 },
  retakeText: { color: colors.primary, fontSize: 13, fontWeight: "600" },
  captureButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: colors.white,
  },
  captureButtonText: { fontSize: 14, color: colors.text, fontWeight: "600" },
  modalContainer: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  message: { color: colors.white, textAlign: "center", fontSize: 14 },
  permButton: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  permButtonText: { color: colors.white, fontWeight: "600" },
  controls: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },
  cancelButton: { width: 70 },
  cancelText: { color: colors.white, fontSize: 14 },
  shutterButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 4,
    borderColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.white },
});
