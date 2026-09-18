import { motion } from "framer-motion";

export default function PreferenceOption({ option, selected, onSelect }) {
  return (
    <motion.button
      type="button"
      className={`vrbo-option ${selected ? "is-selected" : ""}`}
      onClick={() => onSelect(option.id)}
      whileTap={{ scale: 0.98 }}
    >
      <span>{option.emoji}</span>
      <strong>{option.label}</strong>
    </motion.button>
  );
}
