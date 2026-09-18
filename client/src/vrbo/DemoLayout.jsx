import { useEffect, useRef, useState } from "react";
import GuestPhone from "./GuestPhone.jsx";
import GroupScreen from "./GroupScreen.jsx";
import { GUESTS } from "./data.js";

const FRAME_WIDTH = 1080;
const FRAME_HEIGHT = 1920;
const FRAME_GAP = 18;
const LABEL_HEIGHT = 26;

export default function DemoLayout({ experience }) {
  const stageRef = useRef(null);
  const [scale, setScale] = useState(0.22);

  useEffect(() => {
    const fit = () => {
      const width = stageRef.current?.clientWidth || window.innerWidth;
      const height = (stageRef.current?.clientHeight || window.innerHeight) - LABEL_HEIGHT;
      const next = Math.min(height / FRAME_HEIGHT, (width - FRAME_GAP * 3) / (FRAME_WIDTH * 4));
      setScale(Math.max(0.12, next));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const frameStyle = {
    "--scale": String(scale),
    width: FRAME_WIDTH * scale,
    height: LABEL_HEIGHT + FRAME_HEIGHT * scale,
  };

  return (
    <div className="vrbo-demo">
      <div className="vrbo-demo__bar">
        <p>VRBO · Maine Cabin 2027</p>
        <div>
          <button type="button" onClick={experience.reset}>
            Reset experience
          </button>
          <button type="button" onClick={experience.skipToRecommendations}>
            Skip to recommendations
          </button>
          <button type="button" onClick={experience.skipToVoting}>
            Skip to voting
          </button>
          <button type="button" onClick={experience.skipToFinal}>
            Skip to final
          </button>
        </div>
      </div>
      <div className="vrbo-demo__stage" ref={stageRef}>
        <div className="vrbo-demo__row">
          {GUESTS.map((guest) => (
            <div key={guest.id} className="vrbo-demo__frame" style={frameStyle}>
              <p>{guest.label}</p>
              <div className="vrbo-demo__clip">
                <div className="vrbo-demo__screen">
                  <GuestPhone
                  profile={guest}
                  guestId={guest.id}
                  guest={experience.guests[guest.id]}
                  guests={experience.guests}
                  stage={experience.stage}
                  winnerId={experience.winnerId}
                  onAnswer={experience.answer}
                  onRank={experience.rank}
                />
                </div>
              </div>
            </div>
          ))}
          <div className="vrbo-demo__frame" style={frameStyle}>
            <p>Group Screen</p>
            <div className="vrbo-demo__clip">
            <div className="vrbo-demo__screen is-group">
              <GroupScreen
                guests={experience.guests}
                messages={experience.messages}
                stage={experience.stage}
                winnerId={experience.winnerId}
                jamieLines={experience.jamieLines}
                people={experience.guestMeta}
              />
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
