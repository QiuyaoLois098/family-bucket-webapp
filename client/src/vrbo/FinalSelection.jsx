import { useState } from "react";
import { motion } from "framer-motion";
import { findProperty } from "./data.js";

export default function FinalSelection({ winnerId, jamieLines, compact = false }) {
  const property = findProperty(winnerId);
  const [tripOpen, setTripOpen] = useState(false);
  if (!property) return null;

  return (
    <div className={`vrbo-final ${compact ? "is-compact" : ""}`}>
      {compact ? null : (
        <div className="vrbo-confetti" aria-hidden="true">
          {Array.from({ length: 22 }, (_, index) => (
            <span key={index} style={{ "--i": index }} />
          ))}
        </div>
      )}
      <motion.p className="vrbo-kicker" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {compact ? "We found our cabin" : "Our cabin"}
      </motion.p>
      <motion.figure
        className="vrbo-hero"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <span style={{ backgroundImage: `url(${property.image})` }} />
        <figcaption>
          <strong>{property.name}</strong>
          <em>{property.location}</em>
        </figcaption>
      </motion.figure>
      {compact ? (
        <>
          <p className="vrbo-final__note">See you in Maine.</p>
          <button type="button" className="vrbo-trip" onClick={() => setTripOpen(true)}>
            View trip
          </button>
          {tripOpen ? <p className="vrbo-final__trip">Jan 14–17, 2027 · 3 nights · {property.name}</p> : null}
        </>
      ) : (
        <ul className="vrbo-final__lines">
          {jamieLines.map((line) => (
            <motion.li key={line} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              {line}
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
