import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import GlassCard from "./GlassCard";
import { generateDailyTasks, generateWeeklyTasks, generateMonthlyTasks, type TaskPeriod } from "@/lib/taskEngine";

function useCheckedState(storageKey: string) {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch {
      return {};
    }
  });

  const toggle = (key: string) => {
    setChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  return { checked, toggle };
}

function TaskList({ periods, storageKey }: { periods: TaskPeriod[]; storageKey: string }) {
  const { checked, toggle } = useCheckedState(storageKey);

  return (
    <div className="space-y-4">
      {periods.map((period, pi) => (
        <div key={period.period}>
          <p className="text-xs font-semibold text-foreground mb-2">{period.period}</p>
          <div className="space-y-2">
            {period.tasks.map((task, ti) => {
              const key = `${pi}-${ti}`;
              return (
                <label key={key} className="flex items-start gap-2 cursor-pointer group">
                  <Checkbox
                    checked={!!checked[key]}
                    onCheckedChange={() => toggle(key)}
                    className="mt-0.5"
                  />
                  <span className={`text-xs leading-relaxed ${checked[key] ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {task}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

const TaskEngineComponent = () => {
  const [tab, setTab] = useState("daily");
  const today = useMemo(() => new Date(), []);

  const daily = useMemo(() => generateDailyTasks(today), [today]);
  const weekly = useMemo(() => generateWeeklyTasks(today), [today]);
  const monthly = useMemo(() => generateMonthlyTasks(today), [today]);

  return (
    <GlassCard>
      <h2 className="text-sm font-semibold text-foreground mb-3">AI-Suggested Tasks</h2>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full">
          <TabsTrigger value="daily" className="flex-1 text-xs">Daily</TabsTrigger>
          <TabsTrigger value="weekly" className="flex-1 text-xs">Weekly</TabsTrigger>
          <TabsTrigger value="monthly" className="flex-1 text-xs">Monthly</TabsTrigger>
        </TabsList>
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mt-4"
          >
            <TabsContent value="daily" className="mt-0">
              <TaskList periods={daily} storageKey="taskEngine-daily" />
            </TabsContent>
            <TabsContent value="weekly" className="mt-0">
              <TaskList periods={weekly} storageKey="taskEngine-weekly" />
            </TabsContent>
            <TabsContent value="monthly" className="mt-0">
              <TaskList periods={monthly} storageKey="taskEngine-monthly" />
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </GlassCard>
  );
};

export default TaskEngineComponent;
