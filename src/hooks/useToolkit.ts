import { usePersistedState } from "./usePersistedState";
import { useCallback } from "react";

export interface ToolkitItem {
  id: string;
  title: string;
  sourceTab: "templates" | "ai-prompts";
  type: "template" | "ai-prompt" | "customized-ai-prompt";
  tag?: string;
  content: string;
  isAutoAdded?: boolean;
}

const TOOLKIT_KEY = "toolkitItems";

export function useToolkit() {
  const [items, setItems] = usePersistedState<ToolkitItem[]>(TOOLKIT_KEY, []);

  const addItem = useCallback((item: ToolkitItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });
  }, [setItems]);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, [setItems]);

  const hasItem = useCallback((id: string) => {
    return items.some((i) => i.id === id);
  }, [items]);

  const getCustomizedPromptLabel = useCallback((id: string) => {
    const customItems = items.filter((i) => i.type === "customized-ai-prompt");
    const idx = customItems.findIndex((i) => i.id === id);
    return idx >= 0 ? `Customized AI Prompt ${idx + 1}` : null;
  }, [items]);

  const nextCustomizedNumber = useCallback(() => {
    const count = items.filter((i) => i.type === "customized-ai-prompt").length;
    return count + 1;
  }, [items]);

  return { items, addItem, removeItem, hasItem, getCustomizedPromptLabel, nextCustomizedNumber };
}
