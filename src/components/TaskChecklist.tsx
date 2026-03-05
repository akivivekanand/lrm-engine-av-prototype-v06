import { Checkbox } from "@/components/ui/checkbox";
import { usePersistedState } from "@/hooks/usePersistedState";

interface Task {
  id: string;
  task: string;
}

interface TaskChecklistProps {
  title: string;
  tasks: Task[];
  storageKey: string;
}

const TaskChecklist = ({ title, tasks, storageKey }: TaskChecklistProps) => {
  const [checked, setChecked] = usePersistedState<Record<string, boolean>>(storageKey, {});

  const toggle = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = tasks.filter((t) => checked[t.id]).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">
          {completedCount}/{tasks.length}
        </span>
      </div>
      <div className="space-y-2.5">
        {tasks.map((t) => (
          <label
            key={t.id}
            className="flex items-start gap-3 cursor-pointer group"
          >
            <Checkbox
              checked={!!checked[t.id]}
              onCheckedChange={() => toggle(t.id)}
              className="mt-0.5"
            />
            <span
              className={`text-sm leading-relaxed transition-colors ${
                checked[t.id] ? "line-through text-muted-foreground" : "text-foreground"
              }`}
            >
              {t.task}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default TaskChecklist;
