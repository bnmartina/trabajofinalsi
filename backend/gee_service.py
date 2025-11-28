import ee
from typing import Dict, Any

# Inicializar usando tu proyecto
try:
    ee.Initialize(project='proyecto-sidbio')
    print("✅ GEEService usando proyecto-sidbio")
except:
    print("⚠️ No se pudo inicializar con proyecto-sidbio, usando init estándar")
    ee.Initialize()


class GEEService:
    @staticmethod
    def get_climate_anomaly_tiles(scenario: str, mitigation_percent: float = 0) -> Dict[str, Any]:
        """
        Genera tiles de anomalía térmica para Jujuy (2050) usando límites reales.
        """

        print(f"🔧 GEEService EJECUTADO: {scenario}, mitigación {mitigation_percent}%")

        try:
            # ─────────────────────────────────────────────
            # 1) CARGAR LA FORMA REAL DE JUJUY (GAUL 2015)
            # ─────────────────────────────────────────────
            jujuy_fc = (
                ee.FeatureCollection("FAO/GAUL/2015/level1")
                .filter(ee.Filter.eq("ADM1_NAME", "Jujuy"))
            )

            if jujuy_fc.size().getInfo() == 0:
                raise Exception("❌ No se encontró la provincia Jujuy en GAUL/2015")

            jujuy_geom = jujuy_fc.first().geometry()

            # Exportamos coordenadas para dibujar el borde en el frontend
            jujuy_coords = jujuy_geom.coordinates().getInfo()

            # ─────────────────────────────────────────────
            # 2) CARGAR ERA5 (AÑO BASE 2015)
            # ─────────────────────────────────────────────
            era5 = (
                ee.ImageCollection("ECMWF/ERA5_LAND/MONTHLY")
                .filterDate("2015-01-01", "2015-12-31")
                .select("temperature_2m")
                .mean()
                .subtract(273.15)  # Kelvin → Celsius
            )

            # ─────────────────────────────────────────────
            # 3) CÁLCULO DE TEMPERATURA FUTURA
            # ─────────────────────────────────────────────
            # Proyección simple 2050: +3°C (RCP 8.5)
            future_temp = era5.add(3.0)

            if scenario == "base":
                anomaly = future_temp
            else:
                reduction_factor = 1 - (mitigation_percent / 100.0)
                anomaly = future_temp.multiply(reduction_factor)

            anomaly_jujuy = anomaly.clip(jujuy_geom)

            # ─────────────────────────────────────────────
            # 4) VISUALIZACIÓN
            # ─────────────────────────────────────────────
            vis = {
                "min": -2.0,
                "max": 5.0,
                "palette": ["blue", "lightblue", "white", "yellow", "red"],
            }

            map_id = anomaly_jujuy.getMapId(vis)

            # ─────────────────────────────────────────────
            # 5) ESTADÍSTICAS (MEAN)
            # ─────────────────────────────────────────────
            mean_val = (
                anomaly_jujuy.reduceRegion(
                    reducer=ee.Reducer.mean(),
                    geometry=jujuy_geom,
                    scale=8000,
                    maxPixels=1e13
                )
                .getInfo()
            )

            mean = mean_val.get("temperature_2m", None)

            if mean is None:
                mean = 0.0
                print("⚠️ No se pudo calcular mean")

            print(f"📊 Media calculada: {mean:.2f} °C")

            return {
                "template": map_id["tile_fetcher"].url_format,
                "min": vis["min"],
                "max": vis["max"],
                "stats": {"mean": mean},
                "bounds": jujuy_coords,   # ← frontera REAL para Leaflet
            }

        except Exception as e:
            print(f"💥 Error GEEService: {str(e)}")
            raise
