import { useEffect, useMemo, useRef, useState } from "react";
import {
  findOption,
  findGuest,
  GUESTS,
  PRESET_ANSWERS,
  PROPERTIES,
  QUESTIONS,
  winningPropertyId,
} from "./data.js";

function emptyGuests() {
  return {
    alex: { answers: [], rankings: [] },
    sam: { answers: [], rankings: [] },
    taylor: { answers: [], rankings: [] },
  };
}

function openingChat() {
  return [{ id: "open", from: "jamie", text: "Okay everyone — time to pick the cabin." }];
}

export function useMaineCabin() {
  const [guests, setGuests] = useState(emptyGuests);
  const [messages, setMessages] = useState(openingChat);
  const [stage, setStage] = useState("preferences");
  const [winnerId, setWinnerId] = useState(null);
  const [jamieLines, setJamieLines] = useState([]);
  const idRef = useRef(1);
  const postedRef = useRef(new Set(["open"]));
  const holdRef = useRef(false);

  const nextId = () => {
    idRef.current += 1;
    return `m${idRef.current}`;
  };

  const post = (from, text, key) => {
    if (key) {
      if (postedRef.current.has(key)) return;
      postedRef.current.add(key);
    }
    setMessages((current) => [...current, { id: nextId(), from, text }]);
  };

  const allDonePreferences = useMemo(
    () => GUESTS.every((guest) => guests[guest.id].answers.length >= QUESTIONS.length),
    [guests],
  );

  const allDoneVoting = useMemo(
    () => GUESTS.every((guest) => guests[guest.id].rankings.length >= PROPERTIES.length),
    [guests],
  );

  useEffect(() => {
    QUESTIONS.forEach((question, index) => {
      const started = GUESTS.some((guest) => guests[guest.id].answers.length >= index);
      const finished = GUESTS.every((guest) => guests[guest.id].answers.length > index);
      if (started) post("jamie", question.jamie, `q-${question.id}`);
      if (finished && index === 0) post("jamie", "Okay, I think I'm getting the picture...", "picture");
    });
    if (allDonePreferences) post("jamie", "I found a few places that might work for everyone.", "found");
  }, [guests, allDonePreferences]);

  useEffect(() => {
    if (!allDonePreferences || stage !== "preferences" || holdRef.current) return undefined;
    const timer = window.setTimeout(() => setStage("recommendations"), 700);
    return () => window.clearTimeout(timer);
  }, [allDonePreferences, stage]);

  useEffect(() => {
    if (stage !== "recommendations" || holdRef.current) return undefined;
    const timer = window.setTimeout(() => setStage("voting"), 2400);
    return () => window.clearTimeout(timer);
  }, [stage]);

  useEffect(() => {
    if (!allDoneVoting || stage !== "voting") return undefined;
    const timer = window.setTimeout(() => {
      const winner = winningPropertyId(
        {
          alex: guests.alex.rankings,
          sam: guests.sam.rankings,
          taylor: guests.taylor.rankings,
        },
        guests,
      );
      setWinnerId(winner);
      setStage("final");
    }, 900);
    return () => window.clearTimeout(timer);
  }, [allDoneVoting, stage, guests]);

  useEffect(() => {
    if (stage !== "final" || !winnerId) return undefined;
    const property = PROPERTIES.find((item) => item.id === winnerId);
    const lines = GUESTS.map((guest) => {
      const answers = guests[guest.id].answers;
      const hit = property.traits.find((trait) => answers.includes(trait));
      const option = QUESTIONS.flatMap((question) => question.options).find((item) => item.id === hit);
      if (option) return `${option.label} for ${guest.name}.`;
      return `A good fit for ${guest.name}.`;
    });
    lines.push("I think everyone's going to be happy with this one.");
    setJamieLines([]);
    const timers = [
      window.setTimeout(() => post("jamie", "Okay — I think we found it.", "found-it"), 400),
      ...lines.map((line, index) =>
        window.setTimeout(() => {
          setJamieLines((current) => [...current, line]);
          post("jamie", line, `why-${index}`);
        }, 1400 + index * 900),
      ),
    ];
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [stage, winnerId]);

  const answer = (guestId, optionId) => {
    const questionIndex = guests[guestId].answers.length;
    if (questionIndex >= QUESTIONS.length) return;
    const option = findOption(questionIndex, optionId);
    if (!option) return;
    const label = option.emoji ? `${option.label} ${option.emoji}` : option.label;
    post(guestId, label);
    setGuests((current) => {
      if (current[guestId].answers.length !== questionIndex) return current;
      return {
        ...current,
        [guestId]: { ...current[guestId], answers: [...current[guestId].answers, optionId] },
      };
    });
  };

  const rank = (guestId, propertyId) => {
    setGuests((current) => {
      const guest = current[guestId];
      const existing = guest.rankings.indexOf(propertyId);
      let rankings = [...guest.rankings];
      if (existing >= 0) {
        rankings = rankings.filter((id) => id !== propertyId);
      } else if (rankings.length < PROPERTIES.length) {
        rankings = [...rankings, propertyId];
      }
      return { ...current, [guestId]: { ...guest, rankings } };
    });
    setStage((current) => (current === "recommendations" ? "voting" : current));
  };

  const reset = () => {
    holdRef.current = false;
    postedRef.current = new Set(["open"]);
    setGuests(emptyGuests());
    setMessages(openingChat());
    setStage("preferences");
    setWinnerId(null);
    setJamieLines([]);
  };

  const fillAnswers = () => {
    postedRef.current = new Set(["open", "found", "q-setting", "q-vibe", "q-priority", "q-activity", "picture"]);
    const seeded = [openingChat()[0]];
    QUESTIONS.forEach((question, index) => {
      seeded.push({ id: `q-${question.id}`, from: "jamie", text: question.jamie });
      GUESTS.forEach((guest) => {
        const optionId = PRESET_ANSWERS[guest.id][index];
        const option = findOption(index, optionId);
        if (option) {
          seeded.push({
            id: `preset-${guest.id}-${optionId}`,
            from: guest.id,
            text: `${option.label} ${option.emoji}`,
          });
        }
      });
      if (index === 0) seeded.push({ id: "picture", from: "jamie", text: "Okay, I think I'm getting the picture..." });
    });
    seeded.push({ id: "found", from: "jamie", text: "I found a few places that might work for everyone." });
    setMessages(seeded);
    setGuests({
      alex: { answers: [...PRESET_ANSWERS.alex], rankings: [] },
      sam: { answers: [...PRESET_ANSWERS.sam], rankings: [] },
      taylor: { answers: [...PRESET_ANSWERS.taylor], rankings: [] },
    });
  };

  const skipToRecommendations = () => {
    holdRef.current = true;
    fillAnswers();
    setWinnerId(null);
    setJamieLines([]);
    setStage("recommendations");
  };

  const skipToVoting = () => {
    holdRef.current = true;
    fillAnswers();
    setWinnerId(null);
    setJamieLines([]);
    setStage("voting");
  };

  const skipToFinal = () => {
    holdRef.current = true;
    postedRef.current = new Set(["open", "found"]);
    const filled = {
      alex: { answers: [...PRESET_ANSWERS.alex], rankings: ["pine", "moose", "cedar"] },
      sam: { answers: [...PRESET_ANSWERS.sam], rankings: ["cedar", "pine", "moose"] },
      taylor: { answers: [...PRESET_ANSWERS.taylor], rankings: ["moose", "pine", "cedar"] },
    };
    setGuests(filled);
    setMessages([
      ...openingChat(),
      { id: "found-skip", from: "jamie", text: "I found a few places that might work for everyone." },
    ]);
    const winner = winningPropertyId(
      { alex: filled.alex.rankings, sam: filled.sam.rankings, taylor: filled.taylor.rankings },
      filled,
    );
    setWinnerId(winner);
    setJamieLines([]);
    setStage("final");
  };

  return {
    guests,
    messages,
    stage,
    winnerId,
    jamieLines,
    answer,
    rank,
    reset,
    skipToRecommendations,
    skipToVoting,
    skipToFinal,
    guestMeta: (id) => findGuest(id) || { name: "Jamie", color: "#b08a3e", initial: "J" },
  };
}
