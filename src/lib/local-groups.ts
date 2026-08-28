import { getVibelabD1 } from "@/lib/cloudflare-d1";

export type LocalGroup = {
  id: string;
  title: string;
  zone: string;
  track: string;
  capacity: number;
  memberCount: number;
  status: "waiting" | "ready_for_coordination";
};

const groupSeeds = [
  { id: "narmak-web", title: "نارمک / هفت‌حوض", zone: "شرق تهران", track: "طراحی سایت با AI", capacity: 4 },
  { id: "vanak-content", title: "ونک / میرداماد", zone: "مرکز کسب‌وکار تهران", track: "تولید محتوا با AI", capacity: 4 },
  { id: "enghelab-career", title: "انقلاب / دانشگاه تهران", zone: "مرکز تهران", track: "رزومه، نمونه‌کار و کاریابی", capacity: 4 },
  { id: "karaj-web", title: "کرج / عظیمیه و گوهردشت", zone: "کرج", track: "طراحی سایت و پروژه محلی", capacity: 4 },
];

async function ensureGroupTables() {
  const db = await getVibelabD1();
  if (!db) return null;
  await db.prepare(`CREATE TABLE IF NOT EXISTS vibelab_local_groups (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    zone TEXT NOT NULL,
    track TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 4,
    status TEXT NOT NULL DEFAULT 'waiting',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS vibelab_local_group_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id TEXT NOT NULL,
    chat_id INTEGER NOT NULL,
    username TEXT,
    first_name TEXT,
    status TEXT NOT NULL DEFAULT 'waiting',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, chat_id)
  )`).run();
  for (const group of groupSeeds) {
    await db
      .prepare("INSERT OR IGNORE INTO vibelab_local_groups (id, title, zone, track, capacity) VALUES (?, ?, ?, ?, ?)")
      .bind(group.id, group.title, group.zone, group.track, group.capacity)
      .run();
  }
  return db;
}

export async function listLocalGroups(): Promise<LocalGroup[]> {
  const db = await ensureGroupTables();
  if (!db) return groupSeeds.map((group) => ({ ...group, memberCount: 0, status: "waiting" }));
  const result = await db
    .prepare(`SELECT g.id, g.title, g.zone, g.track, g.capacity, COUNT(m.id) AS member_count
      FROM vibelab_local_groups g
      LEFT JOIN vibelab_local_group_members m ON m.group_id = g.id AND m.status != 'cancelled'
      GROUP BY g.id, g.title, g.zone, g.track, g.capacity
      ORDER BY g.zone, g.title`)
    .all<{ id: string; title: string; zone: string; track: string; capacity: number; member_count: number }>();
  return (result.results ?? []).map((group) => ({
    id: group.id,
    title: group.title,
    zone: group.zone,
    track: group.track,
    capacity: group.capacity,
    memberCount: group.member_count,
    status: group.member_count >= group.capacity ? "ready_for_coordination" : "waiting",
  }));
}

export async function joinLocalGroup(input: { groupId: string; chatId: number; username?: string; firstName?: string }) {
  const db = await ensureGroupTables();
  const group = (await listLocalGroups()).find((item) => item.id === input.groupId);
  if (!group) throw new Error("گروه محلی پیدا نشد.");
  if (!db) return group;
  await db
    .prepare("INSERT OR IGNORE INTO vibelab_local_group_members (group_id, chat_id, username, first_name) VALUES (?, ?, ?, ?)")
    .bind(group.id, input.chatId, input.username ?? null, input.firstName ?? null)
    .run();
  const updated = (await listLocalGroups()).find((item) => item.id === input.groupId);
  if (!updated) throw new Error("وضعیت گروه قابل دریافت نیست.");
  if (updated.status === "ready_for_coordination") {
    await db
      .prepare("UPDATE vibelab_local_groups SET status = 'ready_for_coordination', updated_at = ? WHERE id = ?")
      .bind(new Date().toISOString(), updated.id)
      .run();
  }
  return updated;
}
