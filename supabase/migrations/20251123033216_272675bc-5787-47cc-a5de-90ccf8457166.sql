-- Crear tabla para el dataset de camiones
CREATE TABLE public.dataset (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modelo_camion text NOT NULL,
  patente text NOT NULL,
  empresa text NOT NULL,
  distancia_recorrida numeric NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('full', 'hibrido', 'diesel')),
  km_a_recorrer numeric NOT NULL,
  km_electricos numeric NOT NULL DEFAULT 0,
  kwatt_carga numeric NOT NULL DEFAULT 0,
  fecha timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Crear tabla para gestión de energía del hub
CREATE TABLE public.energia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  energia_disponible numeric NOT NULL DEFAULT 150000, -- 150 GWh en MWh
  energia_suministrada numeric NOT NULL DEFAULT 0,
  energia_recibida numeric NOT NULL DEFAULT 0,
  nivel_alerta boolean NOT NULL DEFAULT false,
  fecha_actualizacion timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Crear tabla para datos agregados de camiones
CREATE TABLE public.camiones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('diesel', 'hibrido', 'electrico')),
  horas_ahorradas numeric NOT NULL DEFAULT 0,
  total_recorrido numeric NOT NULL DEFAULT 0,
  total_emisiones numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(nombre)
);

-- Insertar registro inicial de energía
INSERT INTO public.energia (energia_disponible) 
VALUES (150000)
ON CONFLICT DO NOTHING;

-- Habilitar RLS en todas las tablas
ALTER TABLE public.dataset ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camiones ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir lectura y escritura públicas (ya que es un sistema de información pública)
CREATE POLICY "Permitir lectura pública dataset" ON public.dataset
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserción pública dataset" ON public.dataset
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir lectura pública energía" ON public.energia
  FOR SELECT USING (true);

CREATE POLICY "Permitir actualización pública energía" ON public.energia
  FOR UPDATE USING (true);

CREATE POLICY "Permitir lectura pública camiones" ON public.camiones
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserción pública camiones" ON public.camiones
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualización pública camiones" ON public.camiones
  FOR UPDATE USING (true);

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar timestamp en energía
CREATE TRIGGER update_energia_timestamp
  BEFORE UPDATE ON public.energia
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();