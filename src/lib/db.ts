import fs from "fs";
import path from "path";
import { LogEntry } from "@/types";

interface DbStore {
  entries: LogEntry[];
  next_id: number;
}

const DB_DIR = path.join(process.cwd(), "database");
const DB_PATH = path.join(DB_DIR, "log.json");

function load(): DbStore {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) return { entries: [], next_id: 1 };
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8")) as DbStore;
}

function save(store: DbStore): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export function getEntriesByDate(date: string): LogEntry[] {
  return load().entries.filter((e) => e.date === date);
}

export function addEntry(
  entry: Omit<LogEntry, "id" | "created_at">
): LogEntry {
  const store = load();
  const newEntry: LogEntry = {
    ...entry,
    id: store.next_id,
    created_at: new Date().toISOString(),
  };
  store.entries.push(newEntry);
  store.next_id += 1;
  save(store);
  return newEntry;
}

export function deleteEntry(id: number): boolean {
  const store = load();
  const before = store.entries.length;
  store.entries = store.entries.filter((e) => e.id !== id);
  if (store.entries.length === before) return false;
  save(store);
  return true;
}
