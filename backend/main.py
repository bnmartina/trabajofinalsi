# type: ignore
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import ee

app = FastAPI(title="SIDBIO Backend")

# CONEXIÓN EXCLUSIVA con TU NUEVO PROYECTO
GEE_READY = False
try:
    print("🔄 Conectando EXCLUSIVAMENTE con TU proyecto: proyecto-sidbio")
    # FORZAR a usar solo TU proyecto
    ee.Initialize(project='proyecto-sidbio')
    GEE_READY = True
    print("✅ GEE CONECTADO EXCLUSIVAMENTE con proyecto-sidbio")
except Exception as e:
    print(f"❌ Error conectando con TU proyecto: {e}")
    GEE_READY = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TileInfoResponse(BaseModel):
    template: str
    min: Optional[float] = None
    max: Optional[float] = None
    legendHtml: Optional[str] = None
    stats: Optional[dict] = None

def get_demo_tiles(scenario: str, mitigation: float = 0):
    """Datos demo como fallback"""
    if scenario == "base":
        return {
            'template': "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            'min': 2.0,
            'max': 3.8,
            'stats': {'mean': 2.9}
        }
    else:
        reduced_min = 2.0 * (1 - mitigation/100)
        reduced_max = 3.8 * (1 - mitigation/100)
        return {
            'template': "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            'min': round(reduced_min, 2),
            'max': round(reduced_max, 2),
            'stats': {'mean': round((reduced_min + reduced_max) / 2, 2)}
        }

@app.get("/api/gee/map")
async def get_map_tiles(scenario: str, year: str = "2050", mitigation: Optional[float] = None):
    mitigation_percent = mitigation if scenario == "mitigated" else 0
    
    print(f"🎯 Solicitando: {scenario}, {mitigation_percent}%")
    
    if not GEE_READY:
        print("❌ GEE no disponible - usando demo")
        demo_data = get_demo_tiles(scenario, mitigation_percent)
        return TileInfoResponse(
            template=demo_data["template"],
            min=demo_data["min"],
            max=demo_data["max"],
            legendHtml='<div style="background: orange; padding: 10px;">⚠️ GEE no configurado</div>',
            stats=demo_data.get("stats")
        )
    
    try:
        print("🔄 Ejecutando GEEService con TU proyecto...")
        from gee_service import GEEService
        gee_data = GEEService.get_climate_anomaly_tiles(scenario, mitigation_percent)
        
        legend_html = f'<div style="background: linear-gradient(to right, blue, cyan, green, yellow, red); padding: 10px;">NASA Data: {gee_data["min"]}°C - {gee_data["max"]}°C</div>'
        
        print(f"ÉXITO - Tiles GEE generados con TU proyecto")
        
        return TileInfoResponse(
            template=gee_data["template"],
            min=gee_data["min"],
            max=gee_data["max"],
            legendHtml=legend_html,
            stats=gee_data.get("stats")
        )
        
    except Exception as e:
        print(f"💥 ERROR en GEEService: {e}")
        # Fallback a demo
        demo_data = get_demo_tiles(scenario, mitigation_percent)
        return TileInfoResponse(
            template=demo_data["template"],
            min=demo_data["min"],
            max=demo_data["max"],
            legendHtml=f'<div style="background: red; color: white; padding: 10px;">💥 Error: {str(e)[:100]}...</div>',
            stats=demo_data.get("stats")
        )

@app.get("/")
async def root():
    return {"message": "SIDBIO API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)