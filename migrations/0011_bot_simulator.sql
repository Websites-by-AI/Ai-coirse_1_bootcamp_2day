CREATE TABLE IF NOT EXISTS vibelab_bot_simulator_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform TEXT NOT NULL,
  action TEXT NOT NULL,
  payload_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vibelab_bot_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tracking_code TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL,
  order_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ثبت اولیه',
  payload_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vibelab_bot_events_platform ON vibelab_bot_simulator_events(platform, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vibelab_bot_orders_code ON vibelab_bot_orders(tracking_code);
