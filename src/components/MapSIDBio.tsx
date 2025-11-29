import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const MapSIDBio = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const origen = [-24.38333, -65.1];
    const destino = [-23.219497, -67.038491];

    const map = L.map(mapRef.current);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    L.marker([-24.37121, -65.12044]).addTo(map).bindPopup("Hub 1 - Finca El Pongo");
    L.marker(destino).addTo(map).bindPopup("Hub 2 - Cauchari");

    const url = `https://router.project-osrm.org/route/v1/driving/${origen[1]},${origen[0]};${destino[1]},${destino[0]}?overview=full&geometries=geojson`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);

        const polyline = L.polyline(coords, { color: "#2d622e", weight: 4 }).addTo(map);

        map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

        // ---------- CAMIÓN ----------
        const truckIcon = L.icon({
          iconUrl: "/camion.png",
          iconSize: [40, 40],
          iconAnchor: [30, 30],
        });

        const marker = L.marker(coords[0], { icon: truckIcon }).addTo(map);

        let currentIndex = 0;
        let progress = 0;
        const velocidad = 500000;

        const animateTruck = () => {
          const start = coords[currentIndex];
          const end = coords[(currentIndex + 1) % coords.length];

          const lat = start[0] + (end[0] - start[0]) * progress;
          const lng = start[1] + (end[1] - start[1]) * progress;

          marker.setLatLng([lat, lng]);

          progress += velocidad;

          if (progress >= 1) {
            progress = 0;
            currentIndex = (currentIndex + 2) % coords.length;
          }

          requestAnimationFrame(animateTruck);
        };

        animateTruck();
      });

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{ height: "450px", width: "100%", borderRadius: "14px", border: "4px solid #7cc2dd" }}
    />
  );
};

export default MapSIDBio;
