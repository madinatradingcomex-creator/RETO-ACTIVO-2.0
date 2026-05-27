-- ============================================================
-- ESQUEMA DE BASE DE DATOS PARA RETO ACTIVO 2.0 (SUPABASE SQL)
-- ============================================================
-- Copia y pega este script en el editor SQL de Supabase (SQL Editor -> New Query)
-- para inicializar todas las tablas reales necesarias en la nube.

-- 1. TABLA DE USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  lastname TEXT,
  email TEXT UNIQUE NOT NULL,
  company_code TEXT,
  avatar TEXT,
  points INT DEFAULT 100,
  department TEXT,
  role TEXT DEFAULT 'employee',
  level TEXT DEFAULT 'Wellness Principiante 🌱',
  streak INT DEFAULT 1,
  daily_steps_history INT[] DEFAULT '{0,0,0,0,0,0,0}',
  status TEXT DEFAULT 'pending', -- 'pending' (pendiente de aprobación) | 'approved' (aprobado por RRHH)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA DE RETOS
CREATE TABLE IF NOT EXISTS retos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  points INT NOT NULL,
  category TEXT DEFAULT 'mobility',
  target INT NOT NULL,
  unit TEXT DEFAULT 'pasos',
  duration TEXT DEFAULT '7 días',
  icon TEXT DEFAULT '🚴‍♀️',
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA DE RELACIÓN USUARIO-RETO (INSCRIPCIONES A CAMPANAS)
CREATE TABLE IF NOT EXISTS user_challenges (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT REFERENCES usuarios(id) ON DELETE CASCADE,
  challenge_id TEXT REFERENCES retos(id) ON DELETE CASCADE,
  progress FLOAT DEFAULT 0.0,
  status TEXT DEFAULT 'active',
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- 4. TABLA DE EVIDENCIAS Y REGISTROS DE ACTIVIDAD (MANUAL O GOOGLE FIT)
CREATE TABLE IF NOT EXISTS evidencias (
  id TEXT PRIMARY KEY,
  challenge_id TEXT REFERENCES retos(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES usuarios(id) ON DELETE CASCADE,
  user_name TEXT,
  type TEXT,
  activity_type TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  points_awarded INT DEFAULT 0,
  value INT DEFAULT 0,
  metrics JSONB,
  screenshot_url TEXT,
  source TEXT DEFAULT 'manual'
);

-- 5. TABLA DE PREMIOS (TIENDA DE RECOMPENSAS)
CREATE TABLE IF NOT EXISTS rewards (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  points INT NOT NULL,
  category TEXT DEFAULT 'Alimentación',
  icon TEXT DEFAULT '🥑',
  stock INT DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA DE PREMIOS CANJEADOS
CREATE TABLE IF NOT EXISTS redeemed_rewards (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES usuarios(id) ON DELETE CASCADE,
  reward_id TEXT REFERENCES rewards(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  code TEXT NOT NULL,
  status TEXT DEFAULT 'active'
);

-- ============================================================
-- REGISTROS INICIALES SEMILLA (MOCKS Y PORTAL ADMIN)
-- ============================================================

-- Agregar el administrador corporativo inicial (RRHH)
INSERT INTO usuarios (id, name, lastname, email, company_code, avatar, points, department, role, level, status)
VALUES (
  'admin_1', 
  'Recursos Humanos Acme', 
  'Admin', 
  'rrhh@acme.com', 
  'ACME2026', 
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120', 
  0, 
  'Recursos Humanos', 
  'company', 
  'Administrador de Bienestar 🏢', 
  'approved'
) ON CONFLICT (id) DO NOTHING;

-- Agregar algunos retos corporativos preestablecidos
INSERT INTO retos (id, title, description, points, category, target, unit, duration, icon) VALUES
('ch_1', 'Reto Caminante de Acero', 'Camina 45,000 pasos durante el reto para consolidar tus hábitos.', 250, 'mobility', 45000, 'pasos', '7 días', '🚶‍♂️'),
('ch_2', 'Ciclismo Urbano Sustentable', 'Completa 50 km acumulados pedaleando en tus traslados al trabajo.', 350, 'mobility', 50, 'km', '14 días', '🚴‍♀️'),
('ch_3', 'Pausa Activa del Mes', 'Completa 10 sesiones de pausa activa guiada de estiramiento.', 150, 'health', 10, 'sesiones', '15 días', '🧘'),
('ch_4', 'Hidratación Extrema', 'Registra al menos 2 litros de agua diarios durante 10 días.', 200, 'nutrition', 20, 'litros', '10 días', '💧')
ON CONFLICT (id) DO NOTHING;

-- Agregar premios iniciales a la tienda
INSERT INTO rewards (id, title, description, points, category, icon, stock) VALUES
('rw_1', 'Desayuno Saludable Premium', 'Un bowl de frutas orgánicas, avena, yogur griego y jugo verde natural en la cafetería corporativa.', 150, 'Alimentación', '🥑', 15),
('rw_2', 'Pase Mensual Gimnasio Pase', 'Acceso premium con pases ilimitados a la cadena de gimnasios Sport Club por todo un mes.', 500, 'Bienestar', '💪', 5),
('rw_3', 'Día Libre de Cumpleaños Extra', 'Consigue un día extra de descanso pago totalmente flexible a elección dentro del año.', 1200, 'Tiempo Libre', '🗓️', 3),
('rw_4', 'Kit Wellness Corporativo', 'Botella de aluminio térmica, banda elástica de resistencia y una toalla deportiva premium.', 300, 'Equipamiento', '🥤', 20)
ON CONFLICT (id) DO NOTHING;
