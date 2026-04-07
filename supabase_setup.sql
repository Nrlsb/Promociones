-- Crear tabla de estadísticas
CREATE TABLE IF NOT EXISTS stats (
    id TEXT PRIMARY KEY,
    count BIGINT DEFAULT 0
);

-- Insertar contador inicial de visitas si no existe
INSERT INTO stats (id, count)
VALUES ('visits', 0)
ON CONFLICT (id) DO NOTHING;

-- Función para incrementar visitas
CREATE OR REPLACE FUNCTION increment_visits()
RETURNS void AS $$
BEGIN
    UPDATE stats SET count = count + 1 WHERE id = 'visits';
END;
$$ LANGUAGE plpgsql;

-- Crear tabla de promociones
CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    filename TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS en la tabla de promociones
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Políticas para la tabla promotions
-- 1. Permitir lectura pública (si se desea que cualquiera vea las promos)
CREATE POLICY "Allow public read" ON promotions
    FOR SELECT USING (true);

-- 2. Permitir inserción/edición/borrado a usuarios autenticados
CREATE POLICY "Allow authenticated manage" ON promotions
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Políticas para el Bucket de Storage 'promotions'
-- Nota: Estas políticas se aplican a la tabla storage.objects
CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'promotions');

CREATE POLICY "Authenticated Upload" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'promotions');

CREATE POLICY "Authenticated Update" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'promotions');

CREATE POLICY "Authenticated Delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'promotions');

