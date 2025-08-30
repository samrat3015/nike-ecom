// utils/session.ts
import { v4 as uuidv4 } from "uuid";

export const getSessionId = (): string => {
  if (typeof window === "undefined") return ""; // SSR safe

  let sessionId = localStorage.getItem("session_id");
  if (!sessionId) {
    sessionId = uuidv4(); // generate unique
    localStorage.setItem("session_id", sessionId);
  }
  return sessionId;
};

export const setSessionId = (sessionId: string) => {
  localStorage.setItem("session_id", sessionId);
};