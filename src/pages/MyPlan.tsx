import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { format, addDays } from "date-fns";
import { CalendarIcon, Plus, Minus, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import GlassCard from "@/components/GlassCard";
import StepLayout from "@/components/StepLayout";
import { usePersistedState } from "@/hooks/usePersistedState";
import { calculateLRMChainV2, formatDate, daysBetween, stripTime } from "@/lib/calculations";
import { generateCareerPlan } from "@/lib/generateCareerPlan";
import { cn } from "@/lib/utils";
import tasks from "@/data/tasks.json";

const MyPlan = () => {
  const navigate = useNavigate();

  // Persisted inputs from previous steps
  const [gradDate] = usePersistedState<string | null>("gradDate", null);
  const [eadDate] = usePersistedState<string | null>("eadDate", null);
  const [optStatus] = usePersistedState<string>("optStatus", "notApplied");
  const [hiringWeeks] = usePersistedState<number>("hiringWeeks", 6);
  const [prepWindowDays, setPrepWindowDays] = usePersistedState<number>("prepWindowDays", 14);
  const [targetWorkReadyDate] = usePersistedState<string | null>("targetWorkReadyDate", null);
  const [estimatedStartDate] = usePersistedState<string | null>("estimatedStartDate", null);
  const [industryText] = usePersistedState<string>("industryText", "");

  // My Plan specific state
  const todayStr = new Date().toISOString().split("T")[0];
  const [careerPlanStartDate, setCareerPlanStartDate] = usePersistedState<string>("careerPlanStartDate", todayStr);

  // Selected tasks state
  const [selectedDailyTasks, setSelectedDailyTasks] = usePersistedState<Record<string, string[]>>("myPlanDailyTasks", {});
  const [selectedWeeklyTasks, setSelectedWeeklyTasks] = usePersistedState<Record<string, string[]>>("myPlanWeeklyTasks", {});
  const [selectedMonthlyTasks, setSelectedMonthlyTasks] = usePersistedState<Record<string, string[]>>("myPlanMonthlyTasks", {});

  // Custom task inputs
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  // Expand toggles
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // Dynamic card counts
  const [visibleDays, setVisibleDays] = useState(1);
  const [visibleWeeks, setVisibleWeeks] = useState(1);
  const [visibleMonths, setVisibleMonths] = useState(1);

  const isApproved = optStatus === "approved";
  const chosenStartDateStr = isApproved ? eadDate : (targetWorkReadyDate || estimatedStartDate);
  const hasData = gradDate && chosenStartDateStr;

  const chain = hasData
    ? calculateLRMChainV2({
        programEndDate: new Date(gradDate),
        chosenStartDate: new Date(chosenStartDateStr!),
        hiringWeeks,
        prepWindowDays,
      })
    : null;

  const startDate = stripTime(new Date(careerPlanStartDate));

  // Generate initial plan for pre-selected tasks
  const plan = chain
    ? generateCareerPlan({ chain, industryText, hiringWeeks, prepWindowDays, optStatus })
    : null;

  // Initialize tasks on first load
  const getDailyTasks = (dayKey: string, dayIndex: number): string[] => {
    if (selectedDailyTasks[dayKey]) return selectedDailyTasks[dayKey];
    if (plan && plan.actionPlan.daily[dayIndex]) return plan.actionPlan.daily[dayIndex].tasks;
    if (dayIndex === 0) return tasks.dailyOptions.slice(0, 2);
    return [];
  };

  const getWeeklyTasks = (weekKey: string, weekIndex: number): string[] => {
    if (selectedWeeklyTasks[weekKey]) return selectedWeeklyTasks[weekKey];
    if (plan && plan.actionPlan.weekly[weekIndex]) return plan.actionPlan.weekly[weekIndex].tasks.slice(0, 4);
    return [];
  };

  const getMonthlyTasks = (monthKey: string, monthIndex: number): string[] => {
    if (selectedMonthlyTasks[monthKey]) return selectedMonthlyTasks[monthKey];
    if (plan && plan.actionPlan.monthly[monthIndex]) return plan.actionPlan.monthly[monthIndex].tasks.slice(0, 4);
    return [];
  };

  // LRM warning
  const lrmPassed = chain ? startDate.getTime() > chain.lrmDate.getTime() : false;

  // Swimlane calculations
  const prepEnd = addDays(startDate, prepWindowDays);
  const hiringEnd = addDays(prepEnd, hiringWeeks * 7);
  const lastDayToWork = chain ? chain.lastDayToWork : hiringEnd;

  const totalDays = Math.max(1, daysBetween(startDate, lastDayToWork));
  const prepDays = Math.max(0, daysBetween(startDate, prepEnd));
  const hiringDays = Math.max(0, daysBetween(prepEnd, hiringEnd));
  const bufferDays = Math.max(0, daysBetween(hiringEnd, lastDayToWork));

  const prepPct = (prepDays / totalDays) * 100;
  const hiringPct = (hiringDays / totalDays) * 100;
  const bufferPct = (bufferDays / totalDays) * 100;

  const toggleExpand = (key: string) => {
    setExpandedCards(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleTaskInList = (
    listKey: string,
    task: string,
    currentTasks: string[],
    setter: (val: Record<string, string[]> | ((prev: Record<string, string[]>) => Record<string, string[]>)) => void
  ) => {
    const exists = currentTasks.includes(task);
    const updated = exists ? currentTasks.filter(t => t !== task) : [...currentTasks, task];
    setter(prev => ({ ...prev, [listKey]: updated }));
  };

  const addCustomTask = (
    listKey: string,
    currentTasks: string[],
    setter: (val: Record<string, string[]> | ((prev: Record<string, string[]>) => Record<string, string[]>)) => void
  ) => {
    const text = customInputs[listKey]?.trim();
    if (!text) return;
    setter(prev => ({ ...prev, [listKey]: [...currentTasks, text] }));
    setCustomInputs(prev => ({ ...prev, [listKey]: "" }));
  };

  // Day cards data
  const dayCards = Array.from({ length: visibleDays }, (_, i) => {
    const date = addDays(startDate, i);
    const key = format(date, "yyyy-MM-dd");
    const label = i === 0 ? "Today" : i === 1 ? "Tomorrow" : format(date, "EEE, MMM d");
    return { date, key, label, index: i };
  });

  const weekCards = Array.from({ length: visibleWeeks }, (_, i) => ({
    key: `week-${i + 1}`,
    label: `Week ${i + 1}`,
    index: i,
  }));

  const monthCards = Array.from({ length: visibleMonths }, (_, i) => ({
    key: `month-${i + 1}`,
    label: `Month ${i + 1}`,
    index: i,
  }));

  return (
    <StepLayout>
      <h1 className="text-xl font-bold text-foreground">Step 4: Strategy</h1>
      <p className="text-xs text-muted-foreground">Your action strategy helps you translate your preparation window and hiring cycle into manageable daily, weekly, and monthly activities.</p>

      {/* SECTION 1: Career Strategy Timeline */}
      <GlassCard>
        <h2 className="text-sm font-semibold text-foreground mb-4">Career Strategy Timeline</h2>

        {/* Date Picker */}
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Career Plan Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !careerPlanStartDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {careerPlanStartDate ? format(new Date(careerPlanStartDate), "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={new Date(careerPlanStartDate)}
                  onSelect={(d) => d && setCareerPlanStartDate(d.toISOString().split("T")[0])}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Prep Window Adjustment */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Preparation Window</label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => setPrepWindowDays(prev => Math.max(7, prev - 7))}
                disabled={prepWindowDays <= 7}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-sm font-semibold text-foreground min-w-[60px] text-center">{prepWindowDays} days</span>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => setPrepWindowDays(prev => prev + 7)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* LRM Warning */}
        {lrmPassed && (
          <div className="flex items-start gap-2 mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <p className="text-xs text-destructive font-medium leading-relaxed">
              You have started past your Last Responsible Moment. Focus on highest-priority actions immediately.
            </p>
          </div>
        )}

        {/* Swimlane Timeline */}
        {chain && (
          <div className="mt-4 space-y-2">
            <div className="flex rounded-lg overflow-hidden h-8">
              {prepPct > 0 && (
                <div
                  className="bg-emerald-500 flex items-center justify-center text-[9px] font-semibold text-white"
                  style={{ width: `${Math.max(prepPct, 8)}%` }}
                >
                  Prep
                </div>
              )}
              {hiringPct > 0 && (
                <div
                  className="bg-amber-500 flex items-center justify-center text-[9px] font-semibold text-white"
                  style={{ width: `${Math.max(hiringPct, 8)}%` }}
                >
                  Hiring
                </div>
              )}
              {bufferPct > 0 && (
                <div
                  className="bg-purple-500 flex items-center justify-center text-[9px] font-semibold text-white"
                  style={{ width: `${Math.max(bufferPct, 8)}%` }}
                >
                  OPT Buffer
                </div>
              )}
            </div>
            {/* Date labels */}
            <div className="flex justify-between text-[9px] text-muted-foreground">
              <span>{formatDate(startDate)}</span>
              {prepDays > 0 && <span>{formatDate(prepEnd)}</span>}
              <span>{formatDate(hiringEnd)}</span>
              <span>{formatDate(lastDayToWork)}</span>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Prep Window
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Hiring Cycle
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> OPT Buffer
              </span>
            </div>
          </div>
        )}
      </GlassCard>

      {/* SECTION 2: Task Curation */}
      <GlassCard>
        <h2 className="text-sm font-semibold text-foreground mb-3">Task Curation</h2>
        <Tabs defaultValue="daily">
          <TabsList className="w-full">
            <TabsTrigger value="daily" className="flex-1 text-xs">Daily</TabsTrigger>
            <TabsTrigger value="weekly" className="flex-1 text-xs">Weekly</TabsTrigger>
            <TabsTrigger value="monthly" className="flex-1 text-xs">Monthly</TabsTrigger>
          </TabsList>

          {/* DAILY TAB */}
          <TabsContent value="daily" className="mt-3 space-y-3">
            {dayCards.map((day) => {
              const currentTasks = getDailyTasks(day.key, day.index);
              const isExpanded = expandedCards[`daily-${day.key}`];
              return (
                <div key={day.key} className="rounded-lg border bg-card p-4 space-y-2">
                  <h3 className="text-xs font-semibold text-foreground">{day.label}</h3>
                  <p className="text-[10px] text-muted-foreground">{format(day.date, "EEEE, MMMM d, yyyy")}</p>
                  <div className="space-y-1.5">
                    {currentTasks.map((task, ti) => (
                      <label key={ti} className="flex items-start gap-2 cursor-pointer">
                        <Checkbox className="mt-0.5" checked />
                        <span className="text-xs text-foreground leading-relaxed">{task}</span>
                        <button
                          className="ml-auto text-destructive hover:text-destructive/80 shrink-0"
                          onClick={() => toggleTaskInList(day.key, task, currentTasks, setSelectedDailyTasks)}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                      </label>
                    ))}
                  </div>
                  {/* Custom task input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom task..."
                      className="text-xs h-8"
                      value={customInputs[`daily-${day.key}`] || ""}
                      onChange={(e) => setCustomInputs(prev => ({ ...prev, [`daily-${day.key}`]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const inputKey = `daily-${day.key}`;
                          const text = customInputs[inputKey]?.trim();
                          if (text) {
                            setSelectedDailyTasks(prev => ({ ...prev, [day.key]: [...currentTasks, text] }));
                            setCustomInputs(prev => ({ ...prev, [inputKey]: "" }));
                          }
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => {
                        const inputKey = `daily-${day.key}`;
                        const text = customInputs[inputKey]?.trim();
                        if (text) {
                          setSelectedDailyTasks(prev => ({ ...prev, [day.key]: [...currentTasks, text] }));
                          setCustomInputs(prev => ({ ...prev, [inputKey]: "" }));
                        }
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  {/* Customize toggle */}
                  <button
                    className="flex items-center gap-1 text-xs text-primary font-medium mt-1"
                    onClick={() => toggleExpand(`daily-${day.key}`)}
                  >
                    Customize {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                  {isExpanded && (
                    <div className="mt-2 max-h-48 overflow-y-auto space-y-1.5 border-t pt-2">
                      <p className="text-[10px] font-semibold text-muted-foreground mb-1">Immediate Actions Library</p>
                      {tasks.dailyOptions.map((task, li) => {
                        const isSelected = currentTasks.includes(task);
                        return (
                          <label key={li} className="flex items-start gap-2 cursor-pointer">
                            <Checkbox
                              className="mt-0.5"
                              checked={isSelected}
                              onCheckedChange={() => toggleTaskInList(day.key, task, currentTasks, setSelectedDailyTasks)}
                            />
                            <span className={cn("text-xs leading-relaxed", isSelected ? "text-foreground" : "text-muted-foreground")}>
                              {task}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs mt-1"
              disabled={visibleDays >= 12}
              onClick={() => setVisibleDays(prev => Math.min(prev + 1, 12))}
            >
              <Plus className="h-3 w-3 mr-1" /> Add Day
            </Button>
          </TabsContent>

          {/* WEEKLY TAB */}
          <TabsContent value="weekly" className="mt-3 space-y-3">
            {weekCards.map((week) => {
              const currentTasks = getWeeklyTasks(week.key, week.index);
              const isExpanded = expandedCards[`weekly-${week.key}`];
              return (
                <div key={week.key} className="rounded-lg border bg-card p-4 space-y-2">
                  <h3 className="text-xs font-semibold text-foreground">{week.label}</h3>
                  <div className="space-y-1.5">
                    {currentTasks.map((task, ti) => (
                      <label key={ti} className="flex items-start gap-2 cursor-pointer">
                        <Checkbox className="mt-0.5" checked />
                        <span className="text-xs text-foreground leading-relaxed">{task}</span>
                        <button
                          className="ml-auto text-destructive hover:text-destructive/80 shrink-0"
                          onClick={() => toggleTaskInList(week.key, task, currentTasks, setSelectedWeeklyTasks)}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom task..."
                      className="text-xs h-8"
                      value={customInputs[`weekly-${week.key}`] || ""}
                      onChange={(e) => setCustomInputs(prev => ({ ...prev, [`weekly-${week.key}`]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const inputKey = `weekly-${week.key}`;
                          const text = customInputs[inputKey]?.trim();
                          if (text) {
                            setSelectedWeeklyTasks(prev => ({ ...prev, [week.key]: [...currentTasks, text] }));
                            setCustomInputs(prev => ({ ...prev, [inputKey]: "" }));
                          }
                        }
                      }}
                    />
                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => addCustomTask(week.key, currentTasks, setSelectedWeeklyTasks)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <button className="flex items-center gap-1 text-xs text-primary font-medium mt-1" onClick={() => toggleExpand(`weekly-${week.key}`)}>
                    Customize {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                  {isExpanded && (
                    <div className="mt-2 max-h-48 overflow-y-auto space-y-1.5 border-t pt-2">
                      <p className="text-[10px] font-semibold text-muted-foreground mb-1">Short Term Actions Library</p>
                      {tasks.weeklyOptions.map((task, li) => {
                        const isSelected = currentTasks.includes(task);
                        return (
                          <label key={li} className="flex items-start gap-2 cursor-pointer">
                            <Checkbox className="mt-0.5" checked={isSelected} onCheckedChange={() => toggleTaskInList(week.key, task, currentTasks, setSelectedWeeklyTasks)} />
                            <span className={cn("text-xs leading-relaxed", isSelected ? "text-foreground" : "text-muted-foreground")}>{task}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </TabsContent>

          {/* MONTHLY TAB */}
          <TabsContent value="monthly" className="mt-3 space-y-3">
            {monthCards.map((month) => {
              const currentTasks = getMonthlyTasks(month.key, month.index);
              const isExpanded = expandedCards[`monthly-${month.key}`];
              return (
                <div key={month.key} className="rounded-lg border bg-card p-4 space-y-2">
                  <h3 className="text-xs font-semibold text-foreground">{month.label}</h3>
                  <div className="space-y-1.5">
                    {currentTasks.map((task, ti) => (
                      <label key={ti} className="flex items-start gap-2 cursor-pointer">
                        <Checkbox className="mt-0.5" checked />
                        <span className="text-xs text-foreground leading-relaxed">{task}</span>
                        <button
                          className="ml-auto text-muted-foreground hover:text-destructive text-xs shrink-0"
                          onClick={() => toggleTaskInList(month.key, task, currentTasks, setSelectedMonthlyTasks)}
                        >
                          ×
                        </button>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom task..."
                      className="text-xs h-8"
                      value={customInputs[`monthly-${month.key}`] || ""}
                      onChange={(e) => setCustomInputs(prev => ({ ...prev, [`monthly-${month.key}`]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const inputKey = `monthly-${month.key}`;
                          const text = customInputs[inputKey]?.trim();
                          if (text) {
                            setSelectedMonthlyTasks(prev => ({ ...prev, [month.key]: [...currentTasks, text] }));
                            setCustomInputs(prev => ({ ...prev, [inputKey]: "" }));
                          }
                        }
                      }}
                    />
                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => addCustomTask(month.key, currentTasks, setSelectedMonthlyTasks)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <button className="flex items-center gap-1 text-xs text-primary font-medium mt-1" onClick={() => toggleExpand(`monthly-${month.key}`)}>
                    Customize {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                  {isExpanded && (
                    <div className="mt-2 max-h-48 overflow-y-auto space-y-1.5 border-t pt-2">
                      <p className="text-[10px] font-semibold text-muted-foreground mb-1">Long Term Actions Library</p>
                      {tasks.monthlyOptions.map((task, li) => {
                        const isSelected = currentTasks.includes(task);
                        return (
                          <label key={li} className="flex items-start gap-2 cursor-pointer">
                            <Checkbox className="mt-0.5" checked={isSelected} onCheckedChange={() => toggleTaskInList(month.key, task, currentTasks, setSelectedMonthlyTasks)} />
                            <span className={cn("text-xs leading-relaxed", isSelected ? "text-foreground" : "text-muted-foreground")}>{task}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      </GlassCard>

      {/* SECTION 3: Navigation */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate("/step-3-timeline")} className="flex-1">
          Back to Timeline
        </Button>
        <Button onClick={() => navigate("/resource-vault")} className="flex-1">
          Continue to Step 5: Add Resources
        </Button>
      </div>
    </StepLayout>
  );
};

export default MyPlan;
