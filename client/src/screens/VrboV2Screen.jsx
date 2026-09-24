import { useMemo } from "react";
import GuestPhone from "../components/vrbo-v2/GuestPhone.jsx";
import MainChatScreen from "../components/vrbo-v2/MainChatScreen.jsx";
import RankingScreen from "../components/vrbo-v2/RankingScreen.jsx";
import copy from "../data/vrbo-v2/copy.json";
import preferences from "../data/vrbo-v2/preferences.json";
import properties from "../data/vrbo-v2/properties.json";
import users from "../data/vrbo-v2/users.json";
import useLandscapeGate from "../hooks/useLandscapeGate.js";
import useVrboV2Experience, { guests } from "../hooks/useVrboV2Experience.js";

const userById = Object.fromEntries(users.map((user) => [user.id, user]));
const preferenceById = new Map(preferences.map((preference) => [preference.id, preference]));
const propertyById = new Map(properties.map((property) => [property.id, property]));

function VrboLandscapeGate() {
  return (
    <div className="vrbo-v2-stage vrbo-v2-stage--gate">
      <div className="vrbo-v2-gate" role="status" aria-live="polite">
        <p className="vrbo-v2-stage__eyebrow">{copy.stage.eyebrow}</p>
        <div className="vrbo-v2-gate__icon" aria-hidden="true">
          <span className="vrbo-v2-gate__phone" />
          <span className="vrbo-v2-gate__arrow">↻</span>
        </div>
        <h1>{copy.stage.landscapeTitle}</h1>
        <p className="vrbo-v2-gate__body">{copy.stage.landscapeBody}</p>
      </div>
    </div>
  );
}

function VrboDemo() {
  const { state, allSubmitted, joinedUsers, actions } = useVrboV2Experience();
  const {
    stage,
    messages,
    typing,
    joined,
    selections,
    submitted,
    ranked,
    results,
    selectedPropertyId,
    celebrating,
  } = state;

  const joinedCount = joinedUsers.length;
  const submittedCount = joinedUsers.filter((user) => Boolean(submitted[user.id])).length;

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
    <div className="vrbo-v2-stage">
      <button type="button" className="vrbo-v2-stage__restart" onClick={actions.reset}>
        {copy.stage.restart}
      </button>

      <div className="vrbo-v2-stage__board">
        <div className="vrbo-v2-stage__left">
          <section className="vrbo-v2-display vrbo-v2-display--chat">
            <p className="vrbo-v2-display__label">{copy.screenLabels.chat}</p>
            <div className="vrbo-v2-display__body">
              <MainChatScreen
                messages={messages}
                typing={typing}
                userById={userById}
                propertyLookup={propertyLookup}
                celebrating={celebrating}
              />
            </div>
          </section>

          <section className="vrbo-v2-display vrbo-v2-display--rank">
            <p className="vrbo-v2-display__label">{copy.screenLabels.ranking}</p>
            <div className="vrbo-v2-display__body">
              <RankingScreen
                stage={stage}
                ranked={ranked}
                results={results}
                preferenceById={preferenceById}
                submittedCount={submittedCount}
                guestCount={joinedCount}
                allSubmitted={allSubmitted}
                selectedPropertyId={selectedPropertyId}
                actions={actions}
              />
            </div>
          </section>
        </div>

        <div className="vrbo-v2-stage__right">
          <div className="vrbo-v2-stage__phones">
            {guests.map((user) => (
              <GuestPhone
                key={user.id}
                user={user}
                preferences={preferences}
                preferenceById={preferenceById}
                selection={selections[user.id] ?? []}
                submitted={submitted[user.id]}
                joined={Boolean(joined[user.id])}
                locked={stage === "intro"}
                canJoin={stage === "intro" || stage === "selecting"}
                groupReady={allSubmitted}
                messages={messages}
                typing={typing}
                userById={userById}
                onJoin={actions.joinGuest}
                onToggle={actions.togglePreference}
                onSubmit={actions.submitGuest}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VrboV2Screen() {
  const landscapeReady = useLandscapeGate();
  if (!landscapeReady) return <VrboLandscapeGate />;
  return <VrboDemo />;
}
