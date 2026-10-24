import { useEffect, useMemo, useRef, useState } from "react";
import users from "../data/vrbo-v2/users.json";
import { preloadVrboSounds } from "../components/vrbo-v2/vrboSound.js";
import { preloadVrboHotelImages } from "../lib/preloadVrboHotelImages.js";
import { getSocket } from "../socket.js";

export const guests = users.filter((user) => user.role === "guest");

const EMPTY_STATE = {
  runId: 0,
  stage: "intro",
  messages: [],
  typing: [],
  joined: Object.fromEntries(guests.map((user) => [user.id, false])),
  displayNames: Object.fromEntries(guests.map((user) => [user.id, null])),
  selections: Object.fromEntries(guests.map((user) => [user.id, []])),
  submitted: Object.fromEntries(guests.map((user) => [user.id, null])),
  priorities: [],
  summaryText: "",
  sharedPriorityIds: [],
  results: [],
  previewPropertyId: null,
  selectedPropertyId: null,
  celebrating: false,
  hyperionSessionId: null,
};

export default function useVrboV2Session({ syncOnly = false } = {}) {
  const [state, setState] = useState(EMPTY_STATE);
  const [connected, setConnected] = useState(false);
  const [hearSounds, setHearSounds] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    preloadVrboHotelImages();
    preloadVrboSounds();
  }, [state.runId]);

  useEffect(() => {
    const socket = getSocket();

    const onState = (next) => {
      hydratedRef.current = true;
      setState(next);
    };
    const onConnect = () => {
      setConnected(true);
      socket.emit(syncOnly ? "vrbo-v2:subscribe" : "vrbo-v2:join");
    };
    const onDisconnect = () => setConnected(false);

    socket.on("vrbo-v2:state", onState);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    if (socket.connected) onConnect();

    return () => {
      socket.off("vrbo-v2:state", onState);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [syncOnly]);

  useEffect(() => {
    if (hydratedRef.current) setHearSounds(true);
  }, [state]);

  const joinedUsers = useMemo(
    () => guests.filter((user) => Boolean(state.joined?.[user.id])),
    [state.joined],
  );

  const allSubmitted = useMemo(
    () =>
      joinedUsers.length >= 2 &&
      joinedUsers.every((user) => Boolean(state.submitted?.[user.id])),
    [joinedUsers, state.submitted],
  );

  const actions = useMemo(
    () => ({
      startSession: () => getSocket().emit("vrbo-v2:sessionStart"),
      joinGuest: (userId, displayName) =>
        getSocket().emit("vrbo-v2:joinGuest", { userId, displayName }),
      togglePreference: (userId, preferenceId) =>
        getSocket().emit("vrbo-v2:togglePreference", { userId, preferenceId }),
      submitGuest: (userId) => getSocket().emit("vrbo-v2:submitGuest", { userId }),
      searchStays: () => getSocket().emit("vrbo-v2:searchStays"),
      previewProperty: (propertyId) =>
        getSocket().emit("vrbo-v2:previewProperty", { propertyId }),
      selectProperty: (propertyId) =>
        getSocket().emit("vrbo-v2:selectProperty", { propertyId }),
      reset: () => getSocket().emit("vrbo-v2:reset"),
    }),
    [],
  );

  return { state, connected, allSubmitted, joinedUsers, actions, hearSounds };
}
