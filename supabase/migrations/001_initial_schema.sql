-- 사용자 프로필
CREATE TABLE user_profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  nickname    TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 신체 치수 (민감 데이터 — 가능하면 클라이언트에만 저장)
CREATE TABLE measurements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  height_cm   REAL NOT NULL,
  chest_cm    REAL,
  waist_cm    REAL,
  hip_cm      REAL,
  shoulder_cm REAL,
  arm_len_cm  REAL,
  leg_len_cm  REAL,
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- 의류 메타데이터
CREATE TABLE garments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  category      TEXT NOT NULL CHECK (category IN ('top', 'bottom', 'outer', 'dress')),
  brand         TEXT,
  size_spec     JSONB,
  model_url     TEXT NOT NULL,
  thumbnail_url TEXT,
  tags          TEXT[],
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 피팅 히스토리
CREATE TABLE fitting_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  garment_id  UUID REFERENCES garments(id) ON DELETE SET NULL,
  fit_score   REAL,
  screenshot  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_garments_category ON garments(category);
CREATE INDEX idx_garments_tags ON garments USING GIN(tags);
CREATE INDEX idx_fitting_history_user ON fitting_history(user_id, created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitting_history ENABLE ROW LEVEL SECURITY;

-- user_profiles: 본인만 읽기/쓰기
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- measurements: 본인만
CREATE POLICY "Users can manage own measurements"
  ON measurements FOR ALL
  USING (auth.uid() = user_id);

-- fitting_history: 본인만
CREATE POLICY "Users can manage own fitting history"
  ON fitting_history FOR ALL
  USING (auth.uid() = user_id);

-- garments: 모든 사용자 읽기 가능
ALTER TABLE garments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Garments are publicly readable"
  ON garments FOR SELECT
  USING (true);
