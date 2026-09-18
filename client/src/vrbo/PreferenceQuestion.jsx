import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import PreferenceOption from "./PreferenceOption.jsx";

export default function PreferenceQuestion({ question, onAnswer }) {
  const [picked, setPicked] = useState(null);

  const choose = (optionId) => {
    if (picked) return;
    setPicked(optionId);
    window.setTimeout(() => onAnswer(optionId), 380);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        className="vrbo-question"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.28 }}
      >
        <h2>{question.prompt}</h2>
        <div className="vrbo-options">
          {question.options.map((option) => (
            <PreferenceOption
              key={option.id}
              option={option}
              selected={picked === option.id}
              onSelect={choose}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
