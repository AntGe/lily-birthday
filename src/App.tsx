import { AnimatePresence, MotionConfig } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { Backdrop } from "./components/Backdrop";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { CreditsDialog } from "./components/CreditsDialog";
import { CursorSparkles } from "./components/CursorSparkles";
import { CARD_SIZES } from "./components/DestinationCard";
import { photoSrcSet } from "./components/Photo";
import { SoundToggle } from "./components/SoundToggle";
import { TripModal } from "./components/TripModal";
import { BIRTHDAY_LINE, GREETING, TAG_LINE } from "./config";
import { copy } from "./copy";
import { resetConfetti } from "./lib/confetti";
import { heroIds, tripById } from "./lib/data";
import { setSoundEnabled } from "./lib/sound";
import { storage } from "./lib/storage";
import { Choose } from "./scenes/Choose";
import { Chosen } from "./scenes/Chosen";
import { Sealed } from "./scenes/Sealed";
import type { Scene } from "./types";
import "./App.css";

// ?reset in the URL clears everything (handy on a phone, where there's no keyboard).
if (typeof window !== "undefined" && new URLSearchParams(window.location.search).has("reset")) {
  storage.resetAll();
  const url = new URL(window.location.href);
  url.searchParams.delete("reset");
  window.history.replaceState(null, "", url);
}

function initialScene(): Scene {
  if (tripById(storage.getChoice())) return "chosen";
  if (storage.getIntroSeen()) return "choose";
  return "sealed";
}

/** Warm the cache with the four card heroes while the intro plays. */
const warmed: HTMLImageElement[] = [];
function preloadHeroes() {
  if (warmed.length) return;
  for (const id of heroIds) {
    const img = new Image();
    img.decoding = "async";
    img.sizes = CARD_SIZES;
    img.srcset = photoSrcSet(id, "avif");
    warmed.push(img);
  }
}

/** Press R three times quickly to rewrap everything. */
function useTripleR(onReset: () => void) {
  useEffect(() => {
    let presses: number[] = [];
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "r" || e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      const now = performance.now();
      presses = [...presses.filter((t) => now - t < 1200), now];
      if (presses.length >= 3) {
        presses = [];
        onReset();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onReset]);
}

export default function App() {
  const [scene, setScene] = useState<Scene>(initialScene);
  const [opened, setOpened] = useState<Set<string>>(() => new Set(storage.getOpened()));
  const [choice, setChoice] = useState<string | null>(() => storage.getChoice());
  const [modalId, setModalId] = useState<string | null>(null);
  const [pendingChoice, setPendingChoice] = useState<string | null>(null);
  const [choosingId, setChoosingId] = useState<string | null>(null);
  const [showCredits, setShowCredits] = useState(false);
  const [sound, setSound] = useState(() => storage.getSound());
  const [resetKey, setResetKey] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    document.title = copy.documentTitle;
    preloadHeroes();
    // Fetch the script + italic faces (Cyrillic subsets) early so the reveal never writes in a fallback font.
    document.fonts?.load("160px 'Great Vibes'", BIRTHDAY_LINE).catch(() => {});
    document.fonts?.load(`italic 350 40px 'Playfair'`, `${GREETING} ${TAG_LINE}`).catch(() => {});
  }, []);

  useEffect(() => setSoundEnabled(sound), [sound]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const reset = useCallback(() => {
    storage.resetAll();
    resetConfetti();
    setOpened(new Set());
    setChoice(null);
    setModalId(null);
    setPendingChoice(null);
    setChoosingId(null);
    setShowCredits(false);
    setScene("sealed");
    setResetKey((k) => k + 1);
    window.scrollTo({ top: 0 });
    setToast(copy.resetToast);
  }, []);
  useTripleR(reset);

  const onUnwrapped = useCallback((id: string) => {
    setOpened((prev) => {
      const next = new Set(prev).add(id);
      storage.setOpened(next);
      return next;
    });
  }, []);

  const onChoose = useCallback((id: string) => {
    setModalId(null);
    setPendingChoice(id);
  }, []);

  const confirmYes = () => {
    if (!pendingChoice) return;
    const id = pendingChoice;
    setPendingChoice(null);
    storage.setChoice(id);
    setChoice(id);
    window.setTimeout(() => setChoosingId(id), 100);
  };

  const onCelebrated = useCallback(() => {
    setChoosingId(null);
    setScene("chosen");
    window.scrollTo({ top: 0 });
  }, []);

  const changeMind = () => {
    storage.setChoice(null);
    setChoice(null);
    resetConfetti();
    setScene("choose");
  };

  const chosenTrip = tripById(choice);
  const modalTrip = tripById(modalId);
  const pendingTrip = tripById(pendingChoice);

  return (
    <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 170, damping: 20 }}>
      <Backdrop tint={scene === "chosen" ? chosenTrip?.wrap.base : undefined} />
      <CursorSparkles active={scene === "choose" && !modalId && !pendingChoice} />

      <div className="topbar">
        <SoundToggle
          on={sound}
          onToggle={() =>
            setSound((s) => {
              storage.setSound(!s);
              return !s;
            })
          }
        />
      </div>

      <main key={resetKey}>
        <AnimatePresence mode="wait">
          {(scene === "sealed" || scene === "intro") && (
            <Sealed
              key="overture"
              phase={scene}
              onOpen={() => setScene("intro")}
              onDone={() => {
                storage.setIntroSeen(true);
                setScene("choose");
              }}
            />
          )}
          {scene === "choose" && (
            <Choose
              key="choose"
              opened={opened}
              choosingId={choosingId}
              onUnwrapped={onUnwrapped}
              onOpenTrip={setModalId}
              onChoose={onChoose}
              onCelebrated={onCelebrated}
              onCredits={() => setShowCredits(true)}
            />
          )}
          {scene === "chosen" && chosenTrip && <Chosen key="chosen" trip={chosenTrip} onChangeMind={changeMind} />}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {modalTrip && <TripModal key={`trip-${modalTrip.id}`} trip={modalTrip} onClose={() => setModalId(null)} onChoose={onChoose} />}
      </AnimatePresence>
      <AnimatePresence>
        {pendingTrip && <ConfirmDialog key="confirm" trip={pendingTrip} onYes={confirmYes} onNo={() => setPendingChoice(null)} />}
      </AnimatePresence>
      <AnimatePresence>{showCredits && <CreditsDialog key="credits" onClose={() => setShowCredits(false)} />}</AnimatePresence>

      <AnimatePresence>
        {toast && (
          <div className="toast" role="status" key="toast">
            {toast}
          </div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
