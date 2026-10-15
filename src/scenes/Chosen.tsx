import { motion } from "motion/react";
import { FinalScreen } from "../components/FinalScreen";
import type { Trip } from "../types";

/** Scene D's final screen: the postcard for the chosen trip. */
export function Chosen({ trip, onChangeMind }: { trip: Trip; onChangeMind: () => void }) {
  return (
    <motion.div
      className="chosen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
      transition={{ duration: 0.35 }}
    >
      <FinalScreen trip={trip} onChangeMind={onChangeMind} />
    </motion.div>
  );
}
