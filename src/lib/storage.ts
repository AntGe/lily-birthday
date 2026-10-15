// localStorage can throw (private mode, blocked storage), so every access is guarded.
const PREFIX = "bday-trip:v1:";

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(PREFIX + key);
    else window.localStorage.setItem(PREFIX + key, value);
  } catch {
    /* storage unavailable: the experience still works, it just won't remember */
  }
}

export const storage = {
  getOpened(): string[] {
    try {
      const parsed = JSON.parse(read("opened") ?? "[]");
      return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
    } catch {
      return [];
    }
  },
  setOpened(ids: Iterable<string>) {
    write("opened", JSON.stringify([...ids]));
  },
  getChoice(): string | null {
    return read("choice");
  },
  setChoice(id: string | null) {
    write("choice", id);
  },
  getIntroSeen(): boolean {
    return read("intro") === "1";
  },
  setIntroSeen(seen: boolean) {
    write("intro", seen ? "1" : null);
  },
  getSound(): boolean {
    return read("sound") !== "off";
  },
  setSound(on: boolean) {
    write("sound", on ? "on" : "off");
  },
  resetAll() {
    for (const key of ["opened", "choice", "intro"]) write(key, null);
  },
};
