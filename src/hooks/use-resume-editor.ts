"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { useDebounce } from "use-debounce";
import type { ResumeData } from "@/types/resume";

interface EditorState {
  data: ResumeData | null;
  past: ResumeData[];
  future: ResumeData[];
  isSaving: boolean;
  saveStatus: "idle" | "saving" | "saved" | "error";
  lastSaved: Date | null;
  activeSection: string;
  previewMode: "desktop" | "mobile";
  previewZoom: number;
}

type EditorAction =
  | { type: "INIT"; payload: ResumeData }
  | { type: "UPDATE"; payload: Partial<ResumeData> }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "SET_SAVING"; payload: boolean }
  | { type: "SET_SAVE_STATUS"; payload: EditorState["saveStatus"] }
  | { type: "SET_LAST_SAVED"; payload: Date }
  | { type: "SET_ACTIVE_SECTION"; payload: string }
  | { type: "SET_PREVIEW_MODE"; payload: "desktop" | "mobile" }
  | { type: "SET_PREVIEW_ZOOM"; payload: number };

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "INIT":
      return { ...state, data: action.payload, past: [], future: [] };

    case "UPDATE": {
      if (!state.data) return state;
      const newData = { ...state.data, ...action.payload };
      return {
        ...state,
        data: newData,
        past: [...state.past.slice(-49), state.data],
        future: [],
      };
    }

    case "UNDO": {
      if (state.past.length === 0 || !state.data) return state;
      const previous = state.past[state.past.length - 1];
      return {
        ...state,
        data: previous,
        past: state.past.slice(0, -1),
        future: [state.data, ...state.future],
      };
    }

    case "REDO": {
      if (state.future.length === 0 || !state.data) return state;
      const next = state.future[0];
      return {
        ...state,
        data: next,
        past: [...state.past, state.data],
        future: state.future.slice(1),
      };
    }

    case "SET_SAVING":
      return { ...state, isSaving: action.payload };
    case "SET_SAVE_STATUS":
      return { ...state, saveStatus: action.payload };
    case "SET_LAST_SAVED":
      return { ...state, lastSaved: action.payload };
    case "SET_ACTIVE_SECTION":
      return { ...state, activeSection: action.payload };
    case "SET_PREVIEW_MODE":
      return { ...state, previewMode: action.payload };
    case "SET_PREVIEW_ZOOM":
      return { ...state, previewZoom: action.payload };

    default:
      return state;
  }
}

const initialState: EditorState = {
  data: null,
  past: [],
  future: [],
  isSaving: false,
  saveStatus: "idle",
  lastSaved: null,
  activeSection: "personal",
  previewMode: "desktop",
  previewZoom: 100,
};

export function useResumeEditor(resumeId: string) {
  const [state, dispatch] = useReducer(editorReducer, initialState);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedData] = useDebounce(state.data, 2000);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadResume = useCallback(async () => {
    try {
      const res = await fetch(`/api/resumes/${resumeId}/content`);
      if (!res.ok) throw new Error("Failed to load");
      const { data } = await res.json();
      dispatch({ type: "INIT", payload: data });
    } catch {
      // silently fail — caller handles
    }
  }, [resumeId]);

  const saveResume = useCallback(
    async (data: ResumeData) => {
      if (!isMounted.current) return;
      dispatch({ type: "SET_SAVE_STATUS", payload: "saving" });
      try {
        const res = await fetch(`/api/resumes/${resumeId}/content`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Save failed");
        if (isMounted.current) {
          dispatch({ type: "SET_SAVE_STATUS", payload: "saved" });
          dispatch({ type: "SET_LAST_SAVED", payload: new Date() });
        }
      } catch {
        if (isMounted.current) {
          dispatch({ type: "SET_SAVE_STATUS", payload: "error" });
        }
      }
    },
    [resumeId]
  );

  // ── Autosave draft (best-effort, fire-and-forget) ────────────────────────
  const saveDraft = useCallback(
    async (data: ResumeData) => {
      if (!isMounted.current) return;
      try {
        await fetch("/api/drafts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeId,
            title: data.title ?? "Untitled",
            data: data as unknown as Record<string, unknown>,
            source: "autosave",
          }),
        });
      } catch {
        // Draft save is best-effort — do not surface errors to the user.
      }
    },
    [resumeId],
  );

  useEffect(() => {
    if (debouncedData && state.past.length > 0) {
      saveResume(debouncedData);
      void saveDraft(debouncedData);
    }
  }, [debouncedData, saveResume, saveDraft, state.past.length]);

  const update = useCallback((payload: Partial<ResumeData>) => {
    dispatch({ type: "UPDATE", payload });
  }, []);

  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);

  const setActiveSection = useCallback((section: string) => {
    dispatch({ type: "SET_ACTIVE_SECTION", payload: section });
  }, []);

  const setPreviewMode = useCallback((mode: "desktop" | "mobile") => {
    dispatch({ type: "SET_PREVIEW_MODE", payload: mode });
  }, []);

  const setPreviewZoom = useCallback((zoom: number) => {
    dispatch({ type: "SET_PREVIEW_ZOOM", payload: zoom });
  }, []);

  const saveVersion = useCallback(
    async (label: string) => {
      if (!state.data) return;
      const res = await fetch(`/api/resumes/${resumeId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, snapshot: state.data }),
      });
      return res.json();
    },
    [resumeId, state.data]
  );

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      }
      if (ctrl && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) redo();
      }
      if (ctrl && e.key === "s") {
        e.preventDefault();
        if (state.data) saveResume(state.data);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canUndo, canRedo, undo, redo, state.data, saveResume]);

  return {
    ...state,
    canUndo,
    canRedo,
    loadResume,
    saveResume,
    saveDraft,
    update,
    undo,
    redo,
    setActiveSection,
    setPreviewMode,
    setPreviewZoom,
    saveVersion,
  };
}
