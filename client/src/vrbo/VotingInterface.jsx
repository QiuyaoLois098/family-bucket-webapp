import { PROPERTIES } from "./data.js";
import { matchPercent } from "./data.js";
import PropertyCard from "./PropertyCard.jsx";

const LABELS = ["1st", "2nd", "3rd"];

export default function VotingInterface({ guest, guests, onRank }) {
  return (
    <div className="vrbo-voting">
      <p className="vrbo-reply__prompt">Tap 1st, then 2nd, then 3rd.</p>
      <div className="vrbo-voting__list">
        {PROPERTIES.map((property) => {
          const index = guest.rankings.indexOf(property.id);
          return (
            <PropertyCard
              key={property.id}
              property={property}
              compact
              match={matchPercent(property, guests)}
              rank={index >= 0 ? LABELS[index] : null}
              onClick={() => onRank(property.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
