import Chat from "./Chat.jsx";
import FinalSelection from "./FinalSelection.jsx";
import PropertyCard from "./PropertyCard.jsx";
import { IosComposer, IosHome, IosNav, IosStatusBar } from "./IosChrome.jsx";
import { GUESTS, PROPERTIES, matchPercent } from "./data.js";

const LABELS = ["1st", "2nd", "3rd"];

export default function GroupScreen({ guests, messages, stage, winnerId, jamieLines, people }) {
  const showProperties = stage === "recommendations" || stage === "voting";

  const votesFor = (propertyId) =>
    GUESTS.map((guest) => {
      const index = guests[guest.id].rankings.indexOf(propertyId);
      return {
        name: guest.name,
        color: guest.color,
        mark: index >= 0 ? LABELS[index] : "—",
      };
    });

  return (
    <div className="vrbo-group">
      <IosStatusBar />
      <IosNav />
      {stage === "final" && winnerId ? (
        <FinalSelection winnerId={winnerId} jamieLines={jamieLines} />
      ) : showProperties ? (
        <div className="vrbo-group__props">
          <p className="vrbo-chat__stamp">Jamie sent 3 photos</p>
          {PROPERTIES.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              match={matchPercent(property, guests)}
              votes={stage === "voting" ? votesFor(property.id) : null}
            />
          ))}
        </div>
      ) : (
        <>
          <Chat messages={messages} people={people} />
          <IosComposer />
        </>
      )}
      <IosHome />
    </div>
  );
}
