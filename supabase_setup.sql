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
