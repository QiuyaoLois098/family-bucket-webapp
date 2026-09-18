import { GUESTS, JAMIE } from "./data.js";

export function IosStatusBar() {
  return (
    <div className="vrbo-ios-status" aria-hidden="true">
      <span className="vrbo-ios-status__time">9:41</span>
      <i className="vrbo-ios-island" />
      <span className="vrbo-ios-status__end">
        <svg viewBox="0 0 18 12" width="34" height="22" aria-hidden="true">
          <rect x="0" y="7" width="3" height="5" rx="0.6" fill="currentColor" />
          <rect x="5" y="4" width="3" height="8" rx="0.6" fill="currentColor" />
          <rect x="10" y="1.5" width="3" height="10.5" rx="0.6" fill="currentColor" />
          <rect x="15" y="0" width="3" height="12" rx="0.6" fill="currentColor" opacity="0.28" />
        </svg>
        <svg viewBox="0 0 16 12" width="30" height="22" aria-hidden="true">
          <path
            d="M1 8.2C2.7 6.2 5.2 5 8 5s5.3 1.2 7 3.2M3.2 9.8C4.4 8.4 6.1 7.6 8 7.6s3.6.8 4.8 2.2M6.2 11.2c.5-.7 1.3-1.1 2.2-1.1s1.7.4 2.2 1.1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        <span className="vrbo-ios-battery">
          <i />
        </span>
      </span>
    </div>
  );
}

export function IosNav({ you }) {
  const people = [JAMIE, ...GUESTS];
  return (
    <header className="vrbo-ios-nav">
      <span className="vrbo-ios-back" aria-hidden="true">
        ‹
      </span>
      <div className="vrbo-ios-nav__center">
        <div className="vrbo-ios-stack">
          {people.map((person) => (
            <i key={person.id} style={{ background: person.color }} className={person.id === "jamie" ? "is-host" : ""}>
              {person.initial}
            </i>
          ))}
        </div>
        <strong>Maine Cabin 2027</strong>
        <em>{you ? `${you} · Group Message` : "Jamie, Alex, Sam, Taylor"}</em>
      </div>
      <span className="vrbo-ios-call" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="44" height="44">
          <path
            d="M8.5 9.2c1.4 2.6 3.7 4.9 6.3 6.3l2.1-2.1a.9.9 0 0 1 .9-.22c1 .32 2 .5 3.1.5a.9.9 0 0 1 .9.9V19a.9.9 0 0 1-.9.9C11.7 19.9 4.1 12.3 4.1 3.9A.9.9 0 0 1 5 3h4.4a.9.9 0 0 1 .9.9c0 1.1.18 2.1.5 3.1a.9.9 0 0 1-.22.9L8.5 9.2Z"
            fill="#007AFF"
          />
        </svg>
      </span>
    </header>
  );
}

export function IosComposer() {
  return (
    <div className="vrbo-composer" aria-hidden="true">
      <span className="vrbo-composer__plus">+</span>
      <span className="vrbo-composer__field">iMessage</span>
      <span className="vrbo-composer__mic" />
    </div>
  );
}

export function IosHome() {
  return <div className="vrbo-ios-home" aria-hidden="true" />;
}
