import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CANVAS_H, CANVAS_W } from "../canvas.js";
import GuestPhone from "../components/vrbo-v2/GuestPhone.jsx";
import MainChatScreen from "../components/vrbo-v2/MainChatScreen.jsx";
import RankingScreen from "../components/vrbo-v2/RankingScreen.jsx";
import copy from "../data/vrbo-v2/copy.json";
import preferences from "../data/vrbo-v2/preferences.json";
import properties from "../data/vrbo-v2/properties.json";
import users from "../data/vrbo-v2/users.json";
import useLandscapeGate from "../hooks/useLandscapeGate.js";
import useVrboSessionStartOnActivity from "../hooks/useVrboSessionStartOnActivity.js";
import useVrboV2Session, { guests } from "../hooks/useVrboV2Session.js";

/**
 * Portrait 4K canvas (2160×3840 = rotated 3840×2160 panel).
 * Outer frame fluid-fits the container (same idea as iPhone 15 frame);
 * inner UI stays fixed pixels and scales with transform.
 */
function ScaledDisplayCanvas({ className = "", children }) {
  const frameRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return undefined;

    const fit = () => {
      const width = node.clientWidth || 1;
      const height = node.clientHeight || 1;
      setScale(Math.min(width / CANVAS_W, height / CANVAS_H));
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(node);
    window.addEventListener("resize", fit);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  return (
    <div
      ref={frameRef}
      className={`vrbo-v2-displayHd ${className}`.trim()}
      aria-label={`${CANVAS_W}×${CANVAS_H}`}
    >
      <div
        className="vrbo-v2-displayHd__panel"
        style={{
          width: CANVAS_W,
          height: CANVAS_H,
          transform: `scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

const userById = Object.fromEntries(users.map((user) => [user.id, user]));
const preferenceById = new Map(preferences.map((preference) => [preference.id, preference]));
const propertyById = new Map(properties.map((property) => [property.id, property]));

function usePropertyLookup(results) {
  return useMemo(() => {
    const byId = new Map((results ?? []).map((result) => [result.property.id, result]));
    return (propertyId) => {
      if (propertyId == null) return null;
      const scored = byId.get(propertyId);
      if (scored) return scored;
      const property = propertyById.get(propertyId);
      return property ? { property, matched: [] } : null;
    };
  }, [results]);
}

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

function RestartControl({ onReset }) {
  return (
    <div className="vrbo-v2-stage__controls">
      <button type="button" className="vrbo-v2-stage__restart" onClick={onReset}>
        {copy.stage.restart}
      </button>
    </div>
  );
}

function VrboDemo() {
  const { state, allSubmitted, actions } = useVrboV2Session();
  const {
    stage,
    messages,
    typing,
    joined,
    selections,
    submitted,
    summaryText,
    results,
    priorities,
    previewPropertyId,
    selectedPropertyId,
    celebrating,
    displayNames = {},
    runId = 0,
  } = state;
  const [cursorHighlight, setCursorHighlight] = useState(false);
  const [phonesOnly, setPhonesOnly] = useState(false);
  const propertyLookup = usePropertyLookup(results);
  // Demo stage includes interactive + phones — any activity starts VGC session.
  useVrboSessionStartOnActivity(actions.startSession);

  const renderPhone = (user) => (
    <GuestPhone
      key={`${user.id}-${runId}`}
      user={user}
      preferences={preferences}
      preferenceById={preferenceById}
      selection={selections[user.id] ?? []}
      submitted={submitted[user.id]}
      joined={Boolean(joined[user.id])}
      joinedMap={joined}
      displayNames={displayNames}
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
      runId={runId}
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
                  displayNames={displayNames}
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
                  priorities={priorities}
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

const VRBO_LEFT1_REF = "/images/Vrbo-Images/example/left1.png";

/** Display 1 · Organizer chat + same-size design reference (phone-style compare). */
export function VrboLeftPage() {
  const { state, actions } = useVrboV2Session({ syncOnly: true });
  const propertyLookup = usePropertyLookup(state.results);
  useVrboSessionStartOnActivity(actions.startSession);

  // First page reference; swap by stage later as more comps land.
  const referenceSrc = VRBO_LEFT1_REF;
  const referenceCaption = "Reference · intro";

  return (
    <div className="vrbo-v2-device vrbo-v2-device--display">
      <RestartControl onReset={actions.reset} />
      <div className="vrbo-v2-device__stage vrbo-v2-device__stage--display-compare">
        <div className="vrbo-v2-displayFrame">
          <ScaledDisplayCanvas>
            <MainChatScreen
              messages={state.messages}
              typing={state.typing}
              userById={userById}
              propertyLookup={propertyLookup}
              celebrating={state.celebrating}
              joined={state.joined}
              displayNames={state.displayNames ?? {}}
            />
          </ScaledDisplayCanvas>
          <p className="vrbo-v2-displayFrame__caption">Live · chat</p>
        </div>
        <div className="vrbo-v2-displayFrame">
          <div
            className="vrbo-v2-displayHd vrbo-v2-displayHd--reference"
            aria-label={`${CANVAS_W}×${CANVAS_H} reference`}
          >
            <img
              className="vrbo-v2-displayHd__reference"
              src={referenceSrc}
              alt="Vrbo left design reference"
              draggable={false}
            />
          </div>
          <p className="vrbo-v2-displayFrame__caption">{referenceCaption}</p>
        </div>
      </div>
    </div>
  );
}

/** Display 2 · Output / search — receives sessionId; does not start the session. */
export function VrboRightPage() {
  const { state, allSubmitted, actions } = useVrboV2Session({ syncOnly: true });

  return (
    <div className="vrbo-v2-device vrbo-v2-device--display">
      <RestartControl onReset={actions.reset} />
      <div className="vrbo-v2-device__stage vrbo-v2-device__stage--display">
        <ScaledDisplayCanvas>
          <RankingScreen
            stage={state.stage}
            summaryText={state.summaryText}
            results={state.results}
            priorities={state.priorities}
            allSubmitted={allSubmitted}
            previewPropertyId={state.previewPropertyId}
            selectedPropertyId={state.selectedPropertyId}
            actions={actions}
          />
        </ScaledDisplayCanvas>
      </div>
    </div>
  );
}

/** Guest phone page — full bleed by default; `?frame=1` nests UI in iPhone 15 ratio.
 *  Sarah also shows a same-size reference UI beside the live phone when framed.
 */
export function GuestPhonePage({ guestId }) {
  const [params, setParams] = useSearchParams();
  const frameParam = params.get("frame") ?? params.get("iphone");
  const framed =
    frameParam === "1" ||
    (guestId === "sarah" && frameParam !== "0");
  const { state, actions } = useVrboV2Session({ syncOnly: true });
  const {
    stage,
    messages,
    typing,
    joined,
    selections,
    submitted,
    results,
    displayNames = {},
    runId = 0,
  } = state;
  const guest = guests.find((user) => user.id === guestId);
  const propertyLookup = usePropertyLookup(results);
  useVrboSessionStartOnActivity(actions.startSession);

  if (!guest) return null;

  const phone = (
    <GuestPhone
      key={`${guest.id}-${runId}`}
      user={guest}
      preferences={preferences}
      preferenceById={preferenceById}
      selection={selections[guest.id] ?? []}
      submitted={submitted[guest.id]}
      joined={Boolean(joined[guest.id])}
      joinedMap={joined}
      displayNames={displayNames}
      locked={stage === "intro"}
      canJoin={stage === "intro" || stage === "selecting"}
      stage={stage}
      messages={messages}
      typing={typing}
      userById={userById}
      propertyLookup={propertyLookup}
      onJoin={actions.joinGuest}
      onToggle={actions.togglePreference}
      onSubmit={actions.submitGuest}
      bare
      runId={runId}
    />
  );

  const toggleFrame = () => {
    const next = new URLSearchParams(params);
    next.delete("iphone");
    if (framed) {
      if (guestId === "sarah") next.set("frame", "0");
      else {
        next.delete("frame");
      }
    } else {
      next.set("frame", "1");
    }
    setParams(next, { replace: true });
  };

  const showReference = framed && guestId === "sarah";

  return (
    <div
      className={`vrbo-v2-device vrbo-v2-device--phone${framed ? " is-framed" : ""}`}
    >
      <button
        type="button"
        className="vrbo-v2-device__frame-toggle"
        onClick={toggleFrame}
        aria-pressed={framed}
      >
        {framed ? "Full screen" : "iPhone 15 frame"}
      </button>

      {framed ? (
        <div
          className={`vrbo-v2-device__stage${showReference ? " vrbo-v2-device__stage--compare" : ""}`}
        >
          <div className="vrbo-v2-iphone15" aria-label="iPhone 15 preview">
            <div className="vrbo-v2-iphone15__bezel">
              <div className="vrbo-v2-iphone15__screen">{phone}</div>
            </div>
            <p className="vrbo-v2-iphone15__caption">Sarah · iPhone 15</p>
          </div>

          {showReference ? (
            <div className="vrbo-v2-iphone15" aria-label="Reference UI">
              <div className="vrbo-v2-iphone15__bezel vrbo-v2-iphone15__bezel--reference">
                <img
                  className="vrbo-v2-iphone15__reference"
                  src="/images/Vrbo-Images/example/avatar.png"
                  alt="Reference UI"
                  draggable={false}
                />
              </div>
              <p className="vrbo-v2-iphone15__caption">Reference · iPhone 15</p>
            </div>
          ) : null}
        </div>
      ) : (
        phone
      )}
    </div>
  );
}

/** @deprecated use GuestPhonePage({ guestId: "sarah" }) */
export function SarahPhonePage() {
  return <GuestPhonePage guestId="sarah" />;
}

export default function VrboV2Screen() {
  const landscapeReady = useLandscapeGate();
  if (!landscapeReady) return <VrboLandscapeGate />;
  return <VrboDemo />;
}
