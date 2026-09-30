import { useEffect, useMemo, useState } from "react";
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

function CursorHighlight({ enabled }) {
  const [pos, setPos] = useState({ x: -999, y: -999 });

  useEffect(() => {
    if (!enabled) return undefined;
    function onMove(event) {
      setPos({ x: event.clientX, y: event.clientY });
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      className="vrbo-v2-cursor-glow"
      aria-hidden="true"
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
    />
  );
}

function VrboDemo() {
  const { state, allSubmitted, actions } = useVrboV2Experience();
  const {
    stage,
    messages,
    typing,
    joined,
    selections,
    submitted,
    summaryText,
    results,
    previewPropertyId,
    selectedPropertyId,
    celebrating,
  } = state;
  const [cursorHighlight, setCursorHighlight] = useState(false);
  const [phonesOnly, setPhonesOnly] = useState(false);

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
      joined={Boolean(joined[user.id])}
      joinedMap={joined}
      locked={stage === "intro"}
      canJoin={stage === "intro" || stage === "selecting"}
      stage={stage}
      groupReady={allSubmitted}
      messages={messages}
      typing={typing}
      userById={userById}
      propertyLookup={propertyLookup}
      onJoin={actions.joinGuest}
      onToggle={actions.togglePreference}
      onSubmit={actions.submitGuest}
    />
  );

  return (
    <div
      className={`vrbo-v2-stage ${cursorHighlight ? "has-cursor-highlight" : ""} ${
        phonesOnly ? "is-phones-only" : ""
      }`}
    >
      <CursorHighlight enabled={cursorHighlight} />

      <div className="vrbo-v2-stage__controls">
        <button type="button" className="vrbo-v2-stage__restart" onClick={actions.reset}>
          {copy.stage.restart}
        </button>
        <label className="vrbo-v2-stage__toggle">
          <input
            type="checkbox"
            checked={cursorHighlight}
            onChange={(event) => setCursorHighlight(event.target.checked)}
          />
          <span>{copy.stage.cursorHighlight}</span>
        </label>
        <label className="vrbo-v2-stage__toggle">
          <input
            type="checkbox"
            checked={phonesOnly}
            onChange={(event) => setPhonesOnly(event.target.checked)}
          />
          <span>{copy.stage.phonesOnly}</span>
        </label>
      </div>

      <div className="vrbo-v2-stage__board">
        {!phonesOnly ? (
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
                  joined={joined}
                />
              </div>
            </section>

            <section className="vrbo-v2-display vrbo-v2-display--rank">
              <p className="vrbo-v2-display__label">{copy.screenLabels.ranking}</p>
              <div className="vrbo-v2-display__body">
                <RankingScreen
                  stage={stage}
                  summaryText={summaryText}
                  results={results}
                  allSubmitted={allSubmitted}
                  previewPropertyId={previewPropertyId}
                  selectedPropertyId={selectedPropertyId}
                  actions={actions}
                />
              </div>
            </section>
          </div>
        ) : null}

        <div className="vrbo-v2-stage__right">
          {phonesOnly ? (
            <div className="vrbo-v2-stage__phones-row">{guests.map(renderPhone)}</div>
          ) : (
            <>
              <div className="vrbo-v2-stage__phones-top">
                {guests.slice(0, 2).map(renderPhone)}
              </div>
              <div className="vrbo-v2-stage__phones-bottom">
                {guests.slice(2).map(renderPhone)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function SarahPhonePage() {
  const { state, actions } = useVrboV2Experience({ skipIntro: true });
  const {
    stage,
    messages,
    typing,
    joined,
    selections,
    submitted,
    results,
  } = state;
  const sarah = guests.find((user) => user.id === "sarah");

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

  if (!sarah) return null;

  return (
    <div className="vrbo-v2-sarah">
      <GuestPhone
        user={sarah}
        preferences={preferences}
        preferenceById={preferenceById}
        selection={selections[sarah.id] ?? []}
        submitted={submitted[sarah.id]}
        joined={Boolean(joined[sarah.id])}
        joinedMap={joined}
        locked={false}
        canJoin
        stage={stage}
        messages={messages}
        typing={typing}
        userById={userById}
        propertyLookup={propertyLookup}
        onJoin={actions.joinGuest}
        onToggle={actions.togglePreference}
        onSubmit={actions.submitGuest}
        bare
      />
    </div>
  );
}

export default function VrboV2Screen() {
  const landscapeReady = useLandscapeGate();
  if (!landscapeReady) return <VrboLandscapeGate />;
  return <VrboDemo />;
}
