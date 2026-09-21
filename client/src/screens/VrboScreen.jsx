import { useMemo } from "react";
import Celebration from "../components/vrbo/Celebration.jsx";
import GuestPhone from "../components/vrbo/GuestPhone.jsx";
import MainChatScreen from "../components/vrbo/MainChatScreen.jsx";
import RankingScreen from "../components/vrbo/RankingScreen.jsx";
import copy from "../data/vrbo/copy.json";
import preferences from "../data/vrbo/preferences.json";
import properties from "../data/vrbo/properties.json";
import users from "../data/vrbo/users.json";
import useVrboExperience from "../hooks/useVrboExperience.js";

const userById = Object.fromEntries(users.map((user) => [user.id, user]));
const preferenceById = new Map(preferences.map((preference) => [preference.id, preference]));
const propertyById = new Map(properties.map((property) => [property.id, property]));

export default function VrboScreen() {
  const { state, allSubmitted, actions } = useVrboExperience();
  const { stage, messages, typing, selections, submitted, ranked, results, chosenPropertyId } = state;

  const submittedCount = users.filter((user) => Boolean(submitted[user.id])).length;

  const propertyLookup = useMemo(() => {
    const byId = new Map(results.map((result) => [result.property.id, result]));
    return (propertyId) => {
      if (propertyId == null) return null;
      const scored = byId.get(propertyId);
      if (scored) return scored;
      const property = propertyById.get(propertyId);
      return property ? { property, matched: [] } : null;
    };
  }, [results]);

  return (
    <div className="vrbo-stage">
      <header className="vrbo-stage__bar">
        <div>
          <p className="vrbo-stage__eyebrow">{copy.stage.eyebrow}</p>
          <h1>{copy.stage.title}</h1>
        </div>
        <button type="button" className="vrbo-stage__restart" onClick={actions.reset}>
          {copy.stage.restart}
        </button>
      </header>

      <div className="vrbo-stage__top">
        <section className="vrbo-display vrbo-display--chat">
          <p className="vrbo-display__label">{copy.screenLabels.chat}</p>
          <div className="vrbo-display__body">
            <MainChatScreen
              messages={messages}
              typing={typing}
              userById={userById}
              propertyLookup={propertyLookup}
              celebrating={state.celebrating}
            />
            <Celebration active={state.celebrating} />
          </div>
        </section>

        <section className="vrbo-display vrbo-display--rank">
          <p className="vrbo-display__label">{copy.screenLabels.ranking}</p>
          <div className="vrbo-display__body">
            <RankingScreen
              stage={stage}
              ranked={ranked}
              results={results}
              chosenPropertyId={chosenPropertyId}
              preferenceById={preferenceById}
              submittedCount={submittedCount}
              guestCount={users.length}
              allSubmitted={allSubmitted}
              actions={actions}
            />
          </div>
        </section>
      </div>

      <div className="vrbo-stage__bottom">
        {users.map((user) => (
          <GuestPhone
            key={user.id}
            user={user}
            preferences={preferences}
            preferenceById={preferenceById}
            selection={selections[user.id] ?? []}
            submitted={submitted[user.id]}
            locked={stage === "intro"}
            groupReady={allSubmitted}
            onToggle={actions.togglePreference}
            onSubmit={actions.submitGuest}
          />
        ))}
      </div>
    </div>
  );
}
