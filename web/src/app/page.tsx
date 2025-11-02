"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

type TaskPriority = "high" | "medium" | "low";
type TaskStatus = "active" | "completed";

type Task = {
  id: string;
  title: string;
  details: string;
  priority: TaskPriority;
  tags: string[];
  status: TaskStatus;
  createdAt: string;
  dueDate?: string;
};

const priorityCopy: Record<TaskPriority, string> = {
  high: "High Voltage",
  medium: "In Flow",
  low: "Easy Breeze",
};

const priorityBadge: Record<TaskPriority, string> = {
  high: "bg-gradient-to-r from-rose-500/80 to-orange-400/70 border-rose-200/60",
  medium: "bg-gradient-to-r from-sky-500/70 to-cyan-300/70 border-sky-200/60",
  low: "bg-gradient-to-r from-emerald-400/60 to-lime-300/70 border-emerald-200/60",
};

const priorityAccent: Record<TaskPriority, string> = {
  high: "shadow-[0_0_35px_rgba(251,113,133,0.45)]",
  medium: "shadow-[0_0_30px_rgba(56,189,248,0.4)]",
  low: "shadow-[0_0_25px_rgba(74,222,128,0.35)]",
};

const priorityOrder: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const storageKey = "aurora.tasks";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as Task[];
    } catch (error) {
      console.warn("Failed to parse tasks from storage", error);
      return [];
    }
  });
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [tagInput, setTagInput] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [view, setView] = useState<"active" | "completed" | "all">("active");

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(tasks));
  }, [tasks]);

  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.status === "completed").length;
    const active = tasks.length - completed;
    return {
      total: tasks.length,
      completed,
      active,
      completionRate: tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100),
    };
  }, [tasks]);

  const focusTask = useMemo(() => {
    const activeTasks = tasks.filter((task) => task.status === "active");
    if (activeTasks.length === 0) return null;

    return [...activeTasks].sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }

      if (a.dueDate) return -1;
      if (b.dueDate) return 1;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })[0];
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const list =
      view === "active"
        ? tasks.filter((task) => task.status === "active")
        : view === "completed"
          ? tasks.filter((task) => task.status === "completed")
          : tasks;

    return [...list].sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks, view]);

  const createTask = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const parsedTags = tagInput
      .split(",")
      .map((token) => token.trim())
      .filter(Boolean)
      .map((token) => token.replace(/\s+/g, "-").toLowerCase());

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      details: details.trim(),
      priority,
      tags: parsedTags,
      status: "active",
      createdAt: new Date().toISOString(),
      dueDate: dueDate || undefined,
    };

    setTasks((prev) => [newTask, ...prev]);
    setTitle("");
    setDetails("");
    setTagInput("");
    setDueDate("");
    setPriority("medium");
  };

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              status: task.status === "completed" ? "active" : "completed",
            }
          : task,
      ),
    );
  };

  const archiveTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createTask();
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="aurora gradient-spin" />
      <div className="aurora planet-ring" />
      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-6 py-16 text-slate-100 sm:px-10 lg:px-16">
        <header className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-5 py-2 backdrop-blur-xl">
              <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-lime-300" />
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-white/80">
                Orbiting Focus
              </p>
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold sm:text-5xl lg:text-6xl">
                Nebula Task Loom
              </h1>
              <p className="max-w-xl text-base text-white/70 sm:text-lg">
                Sculpt your day with luminous to-dos, woven into a living constellation that adapts to your focus rhythm.
              </p>
            </div>
          </div>
          <div className="glass-panel flex w-full max-w-md flex-col gap-4 rounded-3xl border border-white/15 p-6 text-sm shadow-[0_0_45px_rgba(59,130,246,0.12)]">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/60">
              <span>Mission Pulse</span>
              <span>{new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-3xl font-semibold">{stats.active}</p>
                <p className="text-xs uppercase tracking-wide text-white/60">In orbit</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-3xl font-semibold">{stats.completed}</p>
                <p className="text-xs uppercase tracking-wide text-white/60">Docked</p>
              </div>
              <div className="col-span-2 rounded-2xl border border-white/10 bg-gradient-to-r from-sky-500/20 via-cyan-400/30 to-emerald-400/20 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">Completion wave</p>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className="text-4xl font-semibold">{stats.completionRate}%</p>
                    <span className="text-xs text-white/60">of {stats.total} tasks</span>
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10">
                    <svg
                      viewBox="0 0 48 48"
                      className="h-10 w-10 text-cyan-200"
                      aria-hidden
                    >
                      <defs>
                        <linearGradient id="pulse" x1="0" x2="1" y1="1" y2="0">
                          <stop offset="0%" stopColor="rgba(125,211,252,0.6)" />
                          <stop offset="100%" stopColor="rgba(52,211,153,0.8)" />
                        </linearGradient>
                      </defs>
                      <circle cx="24" cy="24" r="20" stroke="url(#pulse)" strokeWidth="4" fill="none" opacity="0.3" />
                      <path
                        d="M10 24 L18 24 L22 17 L27 31 L31 24 L38 24"
                        fill="none"
                        stroke="url(#pulse)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <form
            className="glass-panel flex flex-col gap-6 rounded-3xl border border-white/15 p-8"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-2">
              <label className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-white/60">
                Mission Name
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">
                  required
                </span>
              </label>
              <input
                className="input-aurora"
                placeholder="Map the headline win"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-[0.35em] text-white/60">Mission Notes</label>
              <textarea
                className="input-aurora min-h-[120px] resize-none"
                placeholder="Capture textures, next micro-steps, or mood cues"
                value={details}
                onChange={(event) => setDetails(event.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-[0.35em] text-white/60">Orbit Height</label>
                <div className="flex gap-2">
                  {(["high", "medium", "low"] as TaskPriority[]).map((level) => (
                    <button
                      key={level}
                      data-level={level}
                      type="button"
                      onClick={() => setPriority(level)}
                      className={`priority-chip ${priority === level ? "active" : ""}`}
                    >
                      <span className="text-xs font-semibold uppercase tracking-[0.35em]">
                        {level}
                      </span>
                      <span className="text-[10px] text-white/60">{priorityCopy[level]}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-[0.35em] text-white/60">Docking Date</label>
                <input
                  type="date"
                  className="input-aurora"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                />
              </div>
              <div className="sm:col-span-2 flex flex-col gap-2">
                <label className="text-xs uppercase tracking-[0.35em] text-white/60">Signal Tags</label>
                <input
                  className="input-aurora"
                  placeholder="design, strategy, stretch"
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                />
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">
                  Comma separated — we’ll auto-sculpt the chips.
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full border border-cyan-200/30 bg-cyan-400/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-cyan-50 transition hover:shadow-[0_0_35px_rgba(34,211,238,0.55)]"
            >
              <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition group-hover:translate-x-[100%] group-hover:opacity-100" />
              Launch Task
            </button>
          </form>

          <aside className="glass-panel flex flex-col gap-6 rounded-3xl border border-white/15 p-8 lg:h-full">
            <div className="flex items-center justify-between">
              <h2 className="text-sm uppercase tracking-[0.35em] text-white/60">Focus Beacon</h2>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/60">
                live
              </span>
            </div>
            {focusTask ? (
              <div className={`relative overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-6 ${priorityAccent[focusTask.priority]}`}>
                <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute right-4 top-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/60">
                  <span className="inline-flex h-2 w-2 rounded-full bg-lime-300" />
                  primed
                </div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/50">up next</p>
                <h3 className="mt-3 text-2xl font-semibold text-white">{focusTask.title}</h3>
                {focusTask.details && (
                  <p className="mt-3 text-sm leading-relaxed text-white/70">
                    {focusTask.details}
                  </p>
                )}
                <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-white/60">
                  <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.3em] ${priorityBadge[focusTask.priority]}`}>
                    <span className="h-2 w-2 rounded-full bg-white" />
                    {focusTask.priority}
                  </span>
                  {focusTask.dueDate && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-cyan-100" aria-hidden>
                        <path
                          d="M7 3v3M17 3v3M4.5 9h15M19 5.5v12a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 17.5v-12A1.5 1.5 0 0 1 6.5 4h11A1.5 1.5 0 0 1 19 5.5Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {new Date(focusTask.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em]">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-cyan-100"
                      aria-hidden
                    >
                      <path
                        d="M5 12h4l2 5 4-10 2 5h2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {new Date(focusTask.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {focusTask.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.3em] text-white/60">
                    {focusTask.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/15 bg-white/10 px-3 py-1"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-white/15 bg-white/5 p-8 text-center text-sm text-white/60">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                  fill="none"
                  className="text-cyan-200"
                  aria-hidden
                >
                  <path
                    d="M24 10v28M10 24h28"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
                <p>Craft a new mission to ignite the focus beacon.</p>
              </div>
            )}
            <div className="mt-auto space-y-3 text-sm text-white/60">
              <p className="text-xs uppercase tracking-[0.35em] text-white/50">Orbit Forecast</p>
              <p>
                Tune into a single priority stream. Each launch syncs with your loop of energy, lighting up the constellation ahead.
              </p>
            </div>
          </aside>
        </section>

        <section className="glass-panel relative overflow-hidden rounded-[32px] border border-white/15 p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.25),transparent_65%)]" aria-hidden />
          <div className="relative flex flex-col gap-6">
            <div className="flex flex-col flex-wrap gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold uppercase tracking-[0.35em] text-white/60">
                  Task Constellation
                </h2>
                <p className="text-sm text-white/60">
                  Stretch the ribbon, tap the nodes, keep the motion electric.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 p-2 text-xs uppercase tracking-[0.3em]">
                {(["active", "completed", "all"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setView(value)}
                    className={`rounded-full px-4 py-1 transition ${
                      view === value
                        ? "bg-gradient-to-r from-cyan-400/70 to-emerald-400/70 text-slate-900"
                        : "text-white/60"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div className="constellation-grid" aria-hidden />

            {filteredTasks.length === 0 ? (
              <div className="relative flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-white/20 bg-white/5 text-center text-sm text-white/60">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-cyan-200"
                  aria-hidden
                >
                  <path
                    d="M4 12h4l2 5 4-10 2 5h4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p>No tasks in this orbit yet. Reroute your focus above.</p>
              </div>
            ) : (
              <ul className="relative grid gap-5 sm:grid-cols-2">
                {filteredTasks.map((task) => (
                  <li
                    key={task.id}
                    className="group relative overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl transition duration-300 hover:border-cyan-200/60 hover:bg-white/10"
                  >
                    <div className={`absolute -inset-px opacity-0 blur-3xl transition duration-500 group-hover:opacity-70 ${priorityAccent[task.priority]}`} aria-hidden />
                    <div className="relative flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.35em] text-white/50">
                            {new Date(task.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          <h3 className="mt-1 text-xl font-semibold text-white">
                            {task.title}
                          </h3>
                        </div>
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.3em] ${priorityBadge[task.priority]}`}
                        >
                          <span className="h-2 w-2 rounded-full bg-white" />
                          {task.priority}
                        </span>
                      </div>
                      {task.details && (
                        <p className="text-sm leading-relaxed text-white/70">
                          {task.details}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.3em] text-white/60">
                        {task.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/15 bg-white/10 px-3 py-1"
                          >
                            #{tag}
                          </span>
                        ))}
                        {task.dueDate && (
                          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1">
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              className="text-cyan-100"
                              aria-hidden
                            >
                              <path
                                d="M7 3v3M17 3v3M4.5 9h15M19 5.5v12a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 17.5v-12A1.5 1.5 0 0 1 6.5 4h11A1.5 1.5 0 0 1 19 5.5Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => toggleTaskStatus(task.id)}
                          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white/70 transition hover:bg-white/20"
                        >
                          <span className={`h-2 w-2 rounded-full ${
                            task.status === "completed" ? "bg-emerald-300" : "bg-white/40"
                          }`} />
                          {task.status === "completed" ? "relaunch" : "complete"}
                        </button>
                        <button
                          type="button"
                          onClick={() => archiveTask(task.id)}
                          className="inline-flex items-center gap-2 rounded-full border border-rose-200/40 bg-rose-400/20 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-rose-50 transition hover:bg-rose-400/30"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="text-rose-100"
                            aria-hidden
                          >
                            <path
                              d="M6 6l12 12M18 6l-12 12"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                          archive
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
