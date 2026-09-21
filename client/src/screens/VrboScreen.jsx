import { useMemo } from "react";
import GuestPhone from "../components/vrbo/GuestPhone.jsx";
import MainChatScreen from "../components/vrbo/MainChatScreen.jsx";
import RankingScreen from "../components/vrbo/RankingScreen.jsx";
import copy from "../data/vrbo/copy.json";
import preferences from "../data/vrbo/preferences.json";
import properties from "../data/vrbo/properties.json";
import users from "../data/vrbo/users.json";
import useLandscapeGate from "../hooks/useLandscapeGate.js";
import useVrboExperience, { guests } from "../hooks/useVrboExperience.js";

const userById = Object.fromEntries(users.map((user) => [user.id, user]));
const preferenceById = new Map(preferences.map((preference) => [preference.id, preference]));
const propertyById = new Map(properties.map((property) => [property.id, property]));
const [guestA, guestB, guestC] = guests;

function VrboLandscapeGate() {
  return (
    <div className="vrbo-stage vrbo-stage--gate">
      <div className="vrbo-gate" role="status" aria-live="polite">
        <p className="vrbo-stage__eyebrow">{copy.stage.eyebrow}</p>
        <div className="vrbo-gate__icon" aria-hidden="true">
          <span className="vrbo-gate__phone" />
          <span className="vrbo-gate__arrow">↻</span>
        </div>
        <h1>{copy.stage.landscapeTitle}</h1>
        <p className="vrbo-gate__body">{copy.stage.landscapeBody}</p>
      </div>
    </div>
  );
}

function VrboDemo() {
  const { state, allSubmitted, actions } = useVrboExperience();
  const { stage, messages, typing, selections, submitted, ranked, results, selectedPropertyId, celebrating } =
    state;

  const submittedCount = guests.filter((user) => Boolean(submitted[user.id])).length;

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

  const renderPhone = (user) => (
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
  );

  return (
    <div className="vrbo-stage">
      <button type="button" className="vrbo-stage__restart" onClick={actions.reset}>
        {copy.stage.restart}
      </button>

      <div className="vrbo-stage__board">
        <div className="vrbo-stage__left">
          <section className="vrbo-display vrbo-display--chat">
            <p className="vrbo-display__label">{copy.screenLabels.chat}</p>
            <div className="vrbo-display__body">
              <MainChatScreen
                messages={messages}
                typing={typing}
                userById={userById}
                propertyLookup={propertyLookup}
                celebrating={celebrating}
              />
            </div>
          </section>

          <section className="vrbo-display vrbo-display--rank">
            <p className="vrbo-display__label">{copy.screenLabels.ranking}</p>
            <div className="vrbo-display__body">
              <RankingScreen
                stage={stage}
                ranked={ranked}
                results={results}
                preferenceById={preferenceById}
                submittedCount={submittedCount}
                guestCount={guests.length}
                allSubmitted={allSubmitted}
                selectedPropertyId={selectedPropertyId}
                actions={actions}
              />
            </div>
          </section>
        </div>

        <div className="vrbo-stage__right">
          <div className="vrbo-stage__phones-top">
            {renderPhone(guestA)}
            {renderPhone(guestB)}
          </div>
          <div className="vrbo-stage__phones-bottom">{renderPhone(guestC)}</div>
        </div>
      </div>
    </div>
  );
}

export default function VrboScreen() {
  const landscapeReady = useLandscapeGate();
  if (!landscapeReady) return <VrboLandscapeGate />;
  return <VrboDemo />;
}
