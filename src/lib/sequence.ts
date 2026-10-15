// A tiny helper for skippable, awaitable choreographies built on Motion's animate().
interface Completable {
  complete: () => void;
  then: (onResolve: () => void, onReject?: () => void) => unknown;
}

export interface Sequencer {
  readonly skipped: boolean;
  /** Finish every running animation instantly and make later steps instant too. */
  skip: () => void;
  /** Register a Motion animation so skip() can complete it. */
  track: <T extends Completable>(controls: T) => T;
  /** A pause that resolves immediately once skipped. */
  wait: (ms: number) => Promise<void>;
  /** Animation options, or instant ones when skipped. */
  opts: <O extends object>(options: O) => O | { duration: number };
}

export function createSequencer(): Sequencer {
  let skipped = false;
  const running = new Set<Completable>();
  const timers = new Set<() => void>();

  return {
    get skipped() {
      return skipped;
    },
    skip() {
      if (skipped) return;
      skipped = true;
      for (const c of [...running]) {
        try {
          c.complete();
        } catch {
          /* already finished */
        }
      }
      for (const resolve of [...timers]) resolve();
    },
    track(controls) {
      running.add(controls);
      controls.then(
        () => running.delete(controls),
        () => running.delete(controls),
      );
      return controls;
    },
    wait(ms) {
      if (skipped) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const done = () => {
          window.clearTimeout(timer);
          timers.delete(done);
          resolve();
        };
        const timer = window.setTimeout(done, ms);
        timers.add(done);
      });
    },
    opts(options) {
      return skipped ? { duration: 0 } : options;
    },
  };
}

export const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
