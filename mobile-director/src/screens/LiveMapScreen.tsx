import { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { useFocusEffect } from "@react-navigation/native";
import { fetchLiveMap } from "../api/client";
import { colors } from "../theme";
import { CenteredSpinner } from "../components/ui";
import type { LiveMapData } from "../api/types";

function buildMapHtml(data: LiveMapData) {
  const payload = JSON.stringify(data).replace(/</g, "\\u003c");
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
    .driver-icon { background: #047857; border: 2px solid #fff; border-radius: 50%; width: 14px; height: 14px; box-shadow: 0 0 4px rgba(0,0,0,0.4); }
    .vehicle-icon { background: #1d4ed8; border: 2px solid #fff; border-radius: 50%; width: 12px; height: 12px; box-shadow: 0 0 4px rgba(0,0,0,0.4); }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const data = ${payload};
    const map = L.map('map', { zoomControl: false }).setView(data.center, 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    const driverIcon = L.divIcon({ className: 'driver-icon', iconSize: [14, 14] });
    const vehicleIcon = L.divIcon({ className: 'vehicle-icon', iconSize: [12, 12] });

    data.drivers.forEach((d) => {
      L.marker([d.lat, d.lng], { icon: driverIcon }).addTo(map).bindPopup(d.name + ' (' + d.status + ')');
    });
    data.vehicles.forEach((v) => {
      L.marker([v.lat, v.lng], { icon: vehicleIcon }).addTo(map).bindPopup(v.label);
    });
    data.routes.forEach((r) => {
      if (r.coordinates.length > 1) {
        L.polyline(r.coordinates, { color: '#047857', weight: 3, opacity: 0.7 }).addTo(map);
      }
    });
  </script>
</body>
</html>`;
}

export function LiveMapScreen() {
  const [data, setData] = useState<LiveMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const result = await fetchLiveMap();
      setData(result);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const html = useMemo(() => (data ? buildMapHtml(data) : ""), [data]);

  if (loading || !data) return <CenteredSpinner />;

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>{data.drivers.length} chauffeur(s) localisé(s)</Text>
        <Text style={styles.summaryText}>{data.vehicles.length} véhicule(s) GPS</Text>
        <Text style={styles.summaryText}>{data.routes.length} tournée(s) active(s)</Text>
      </View>
      <WebView
        key={html.length}
        style={styles.map}
        originWhitelist={["*"]}
        source={{ html }}
        pullToRefreshEnabled
        onRefresh={() => load(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  summary: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryText: { fontSize: 12, color: colors.textMuted },
  map: { flex: 1 },
});
