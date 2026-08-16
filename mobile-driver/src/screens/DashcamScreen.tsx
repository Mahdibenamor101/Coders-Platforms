import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { getSession } from "../storage/session";
import { uploadDashcamSegment } from "../api/client";
import { colors } from "../theme";

const SEGMENT_DURATION_SEC = 120;

type Props = NativeStackScreenProps<RootStackParamList, "Dashcam">;

export function DashcamScreen({ route, navigation }: Props) {
  const { tripId } = route.params;
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [recording, setRecording] = useState(false);
  const [segmentsUploaded, setSegmentsUploaded] = useState(0);

  const cameraRef = useRef<CameraView>(null);
  const stoppingRef = useRef(false);
  const segmentIndexRef = useRef(0);
  const sessionRef = useRef<{ baseUrl: string; token: string } | null>(null);

  useEffect(() => {
    getSession().then((s) => {
      sessionRef.current = s;
    });
    return () => {
      stoppingRef.current = true;
      cameraRef.current?.stopRecording();
    };
  }, []);

  async function recordSegment() {
    if (!cameraRef.current) return;
    try {
      const video = await cameraRef.current.recordAsync({
        maxDuration: SEGMENT_DURATION_SEC,
      });
      const session = sessionRef.current;
      if (video?.uri && session) {
        uploadDashcamSegment(session.baseUrl, session.token, tripId, segmentIndexRef.current, video.uri);
        segmentIndexRef.current += 1;
        setSegmentsUploaded((n) => n + 1);
      }
    } catch {
      // ignore a single failed segment and keep the loop going
    }
    if (!stoppingRef.current) {
      recordSegment();
    }
  }

  function start() {
    stoppingRef.current = false;
    segmentIndexRef.current = 0;
    setSegmentsUploaded(0);
    setRecording(true);
    recordSegment();
  }

  function stop() {
    stoppingRef.current = true;
    cameraRef.current?.stopRecording();
    setRecording(false);
  }

  const hasPermissions = cameraPermission?.granted && micPermission?.granted;

  return (
    <View style={styles.container}>
      {hasPermissions ? (
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" mode="video" mute />
      ) : (
        <View style={styles.center}>
          <Text style={styles.message}>
            Autorisez la caméra et le microphone pour activer la dashcam.
          </Text>
          <Pressable
            style={styles.permButton}
            onPress={async () => {
              await requestCameraPermission();
              await requestMicPermission();
            }}
          >
            <Text style={styles.permButtonText}>Autoriser</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Text style={styles.back}>← Retour</Text>
        </Pressable>
        {recording && (
          <View style={styles.recIndicator}>
            <View style={styles.recDot} />
            <Text style={styles.recText}>{segmentsUploaded} segment(s) envoyé(s)</Text>
          </View>
        )}
      </View>

      {hasPermissions && (
        <View style={styles.bottomBar}>
          {recording ? (
            <Pressable style={styles.stopButton} onPress={stop}>
              <Text style={styles.stopButtonText}>Arrêter</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.startButton} onPress={start}>
              <Text style={styles.startButtonText}>Démarrer la dashcam</Text>
            </Pressable>
          )}
          <Text style={styles.hint}>
            Enregistre par segments de 2 min tant que cet écran reste ouvert.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  message: { color: colors.white, textAlign: "center", fontSize: 14 },
  permButton: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  permButtonText: { color: colors.white, fontWeight: "600" },
  topBar: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  back: { color: colors.white, fontSize: 14, fontWeight: "600" },
  recIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger },
  recText: { color: colors.white, fontSize: 12 },
  bottomBar: { position: "absolute", bottom: 40, left: 0, right: 0, alignItems: "center", gap: 8 },
  startButton: { backgroundColor: colors.primary, borderRadius: 999, paddingHorizontal: 28, paddingVertical: 14 },
  startButtonText: { color: colors.white, fontWeight: "700", fontSize: 15 },
  stopButton: { backgroundColor: colors.danger, borderRadius: 999, paddingHorizontal: 28, paddingVertical: 14 },
  stopButtonText: { color: colors.white, fontWeight: "700", fontSize: 15 },
  hint: { color: "rgba(255,255,255,0.7)", fontSize: 11, textAlign: "center", paddingHorizontal: 30 },
});
