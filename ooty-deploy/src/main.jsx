import React from "react";
import ReactDOM from "react-dom/client";
import OotyTripManager from "./OotyTripManager.jsx";

/*
  The app was originally built for the Claude Artifacts runtime, which provides a
  shared key-value store at `window.storage`. Outside that runtime we provide a
  drop-in shim backed by localStorage so the app behaves identically.

  NOTE: localStorage is per-browser/per-device. Everyone opening the deployed
  site gets their OWN copy of the data — it is NOT shared across people the way
  the artifact version was. See the README for how to add real shared storage
  (e.g. Supabase) if you need the whole group to see the same numbers.
*/
if (!window.storage) {
  window.storage = {
    async get(key) {
      const raw = localStorage.getItem(key);
      return raw != null ? { key, value: raw } : null;
    },
    async set(key, value) {
      localStorage.setItem(key, value);
      return { key, value };
    },
    async delete(key) {
      localStorage.removeItem(key);
      return { key, deleted: true };
    },
    async list(prefix = "") {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) keys.push(k);
      }
      return { keys, prefix };
    },
  };
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <OotyTripManager />
  </React.StrictMode>
);
