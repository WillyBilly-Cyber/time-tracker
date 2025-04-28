"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Trash, Plus, Minus } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface Project {
  id: string;
  name: string;
  time: number;
}

interface TimerState {
  base: number; // accumulated seconds
  running: boolean;
  startedAt: number | null; // timestamp in ms, or null if not running
}

interface AppState {
  day: TimerState;
  general: TimerState;
  projects: Project[];
  projectTimers: Record<string, TimerState>;
  projectRunning: string | null;
}

const LOCAL_STORAGE_KEY = "timeTrackerState";
const TIME_INCREMENT = 300;

function nowSec() {
  return Math.floor(Date.now() / 1000);
}

function loadState(): AppState {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as AppState;
      // Ensure all timers have required fields
      if (!parsed.day) parsed.day = { base: 0, running: false, startedAt: null };
      if (!parsed.general) parsed.general = { base: 0, running: false, startedAt: null };
      if (!parsed.projectTimers) parsed.projectTimers = {};
      for (const id in parsed.projectTimers) {
        if (!parsed.projectTimers[id]) parsed.projectTimers[id] = { base: 0, running: false, startedAt: null };
      }
      return parsed;
    }
  } catch {}
  return {
    day: { base: 0, running: false, startedAt: null },
    general: { base: 0, running: false, startedAt: null },
    projects: [],
    projectTimers: {},
    projectRunning: null,
  };
}

function getTimerDisplay(timer: TimerState) {
  if (!timer.running || !timer.startedAt) return timer.base;
  return timer.base + (nowSec() - Math.floor(timer.startedAt / 1000));
}

export default function TimeTracker() {
  const initial = loadState();
  const [day, setDay] = useState<TimerState>(initial.day);
  const [general, setGeneral] = useState<TimerState>(initial.general);
  const [projects, setProjects] = useState<Project[]>(initial.projects);
  const [projectTimers, setProjectTimers] = useState<Record<string, TimerState>>(initial.projectTimers);
  const [projectRunning, setProjectRunning] = useState<string | null>(initial.projectRunning);

  const [, setTick] = useState(0); // for forcing re-render
  const saveTimeout = useRef<number | undefined>(undefined);

  // Force re-render every second for display
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Debounced save to localStorage
  useEffect(() => {
    clearTimeout(saveTimeout.current);
    saveTimeout.current = window.setTimeout(() => {
      const state: AppState = {
        day,
        general,
        projects,
        projectTimers,
        projectRunning,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    }, 1000);
    return () => clearTimeout(saveTimeout.current);
  }, [day, general, projects, projectTimers, projectRunning]);

  // Time Transfer Functions
  const transferTimeGeneralDay = (adding: boolean) => {
    if (adding) {
      setGeneral(g => ({ ...g, base: g.base + TIME_INCREMENT }));
      setDay(d => ({ ...d, base: d.base + TIME_INCREMENT }));
    } else {
      if (getTimerDisplay(general) >= TIME_INCREMENT && getTimerDisplay(day) >= TIME_INCREMENT) {
        setGeneral(g => ({ ...g, base: g.base - TIME_INCREMENT }));
        setDay(d => ({ ...d, base: d.base - TIME_INCREMENT }));
      }
    }
  };

  const transferTimeProjectGeneral = (projectId: string, adding: boolean) => {
    if (adding) {
      if (getTimerDisplay(general) >= TIME_INCREMENT) {
        setProjectTimers(prev => ({
          ...prev,
          [projectId]: {
            ...prev[projectId],
            base: (prev[projectId]?.base || 0) + TIME_INCREMENT,
          },
        }));
        setGeneral(g => ({ ...g, base: g.base - TIME_INCREMENT }));
      }
    } else {
      if ((projectTimers[projectId]?.base || 0) >= TIME_INCREMENT) {
        setProjectTimers(prev => ({
          ...prev,
          [projectId]: {
            ...prev[projectId],
            base: prev[projectId].base - TIME_INCREMENT,
          },
        }));
        setGeneral(g => ({ ...g, base: g.base + TIME_INCREMENT }));
      }
    }
  };

  // TIMER STATE LOGIC ENFORCEMENT
  const startDayTimer = () => {
    if (!day.running) setDay({ ...day, running: true, startedAt: Date.now() });
    if (!general.running) setGeneral({ ...general, running: true, startedAt: Date.now() });
    setProjectRunning(null);
    // Stop any running project
    setProjectTimers(prev => {
      const updated = { ...prev };
      for (const id in updated) {
        if (updated[id].running) {
          updated[id] = { ...updated[id], base: getTimerDisplay(updated[id]), running: false, startedAt: null };
        }
      }
      return updated;
    });
  };

  const stopDayTimer = () => {
    setDay({ ...day, base: getTimerDisplay(day), running: false, startedAt: null });
    setGeneral({ ...general, base: getTimerDisplay(general), running: false, startedAt: null });
    setProjectTimers(prev => {
      const updated = { ...prev };
      for (const id in updated) {
        updated[id] = { ...updated[id], base: getTimerDisplay(updated[id]), running: false, startedAt: null };
      }
      return updated;
    });
    setProjectRunning(null);
  };

  const startGeneralTimer = () => {
    setGeneral({ ...general, running: true, startedAt: Date.now() });
    setDay({ ...day, running: true, startedAt: day.running ? day.startedAt : Date.now() });
    setProjectTimers(prev => {
      const updated = { ...prev };
      for (const id in updated) {
        if (updated[id].running) {
          updated[id] = { ...updated[id], base: getTimerDisplay(updated[id]), running: false, startedAt: null };
        }
      }
      return updated;
    });
    setProjectRunning(null);
  };

  const stopGeneralTimer = () => {
    setGeneral({ ...general, base: getTimerDisplay(general), running: false, startedAt: null });
  };

  const startProjectTimer = (projectId: string) => {
    setGeneral({ ...general, base: getTimerDisplay(general), running: false, startedAt: null });
    setDay({ ...day, running: true, startedAt: day.running ? day.startedAt : Date.now() });
    setProjectTimers(prev => {
      const updated = { ...prev };
      for (const id in updated) {
        if (id === projectId) {
          updated[id] = { ...updated[id], running: true, startedAt: Date.now() };
        } else if (updated[id].running) {
          updated[id] = { ...updated[id], base: getTimerDisplay(updated[id]), running: false, startedAt: null };
        }
      }
      return updated;
    });
    setProjectRunning(projectId);
  };

  const stopProjectTimer = () => {
    if (projectRunning) {
      setProjectTimers(prev => ({
        ...prev,
        [projectRunning]: {
          ...prev[projectRunning],
          base: getTimerDisplay(prev[projectRunning]),
          running: false,
          startedAt: null,
        },
      }));
    }
    setGeneral({ ...general, running: true, startedAt: Date.now() });
    setDay({ ...day, running: true, startedAt: day.running ? day.startedAt : Date.now() });
    setProjectRunning(null);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const addProject = (name: string) => {
    if (name.trim()) {
      const newProject: Project = { id: uuidv4(), name, time: 0 };
      setProjects((prevProjects) => [...prevProjects, newProject]);
      setProjectTimers((prevTimers) => ({
        ...prevTimers,
        [newProject.id]: { base: 0, running: false, startedAt: null },
      }));
    }
  };

  const deleteProject = (projectId: string) => {
    setProjects((prevProjects) => prevProjects.filter((project) => project.id !== projectId));
    setProjectTimers((prevTimers) => {
      const updatedTimers = { ...prevTimers };
      delete updatedTimers[projectId];
      return updatedTimers;
    });

    if (projectRunning === projectId) {
      stopProjectTimer();
    }
  };

  const exportToCSV = () => {
    const headers = ["Timer", "Time (HH:mm:ss)"];
    const data = [
      ["Day Timer", formatTime(getTimerDisplay(day))],
      ["General Timer", formatTime(getTimerDisplay(general))],
      ...projects.map((project) => [
        `Project: ${project.name}`,
        formatTime(getTimerDisplay(projectTimers[project.id] || { base: 0, running: false, startedAt: null })),
      ]),
    ];

    const csvContent = [headers, ...data]
      .map((row) => row.join(","))
      .join("\n");

    const currentDate = new Date();
    const formattedDate = currentDate
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      .replace(/ /g, "_");

    const filename = `Wills_Time_For_${formattedDate}.csv`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader className="">
          <CardTitle className="text-2xl font-bold text-gray-900">
            WillBilly5000 Daily Time Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="">
          {/* Day Timer */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Day Timer</h3>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-gray-900">
                <Clock className="inline-block mr-2 h-6 w-6" />
                {formatTime(getTimerDisplay(day))}
              </div>
              <div>
                <Button
                  onClick={startDayTimer}
                  disabled={day.running}
                  className={`mr-2 ${day.running ? "bg-green-500 text-white" : ""}`}
                >
                  Start
                </Button>
                <Button onClick={stopDayTimer} disabled={!day.running} className="mr-2">
                  Stop
                </Button>
                <Button onClick={() => setDay({ ...day, base: 0, startedAt: day.running ? Date.now() : null })} variant="outline" disabled={false}>
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {/* General Timer */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">General Timer</h3>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-gray-900">
                <Clock className="inline-block mr-2 h-6 w-6" />
                {formatTime(getTimerDisplay(general))}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => transferTimeGeneralDay(true)}
                  variant="outline"
                  className="px-2"
                  title="Add 5 minutes to both timers"
                  disabled={false}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => transferTimeGeneralDay(false)}
                  variant="outline"
                  className="px-2"
                  title="Remove 5 minutes from both timers"
                  disabled={getTimerDisplay(general) < TIME_INCREMENT || getTimerDisplay(day) < TIME_INCREMENT}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => {
                    if (projectRunning !== null) {
                      stopProjectTimer();
                    }
                    startGeneralTimer();
                  }}
                  disabled={general.running}
                  className={`mr-2 ${general.running ? "bg-green-500 text-white" : ""}`}
                >
                  Start
                </Button>
                <Button onClick={stopGeneralTimer} disabled={!general.running} className="mr-2">
                  Stop
                </Button>
                <Button
                  onClick={() => setGeneral({ ...general, base: 0, startedAt: general.running ? Date.now() : null })}
                  variant="outline"
                  disabled={projectRunning !== null}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {/* Project Management */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Project Management</h3>
            <Label htmlFor="project-name" className="text-gray-800">
              Add New Project
            </Label>
            <div className="flex items-center mt-2">
              <Input
                id="project-name"
                className="mr-2"
                placeholder="Project Name"
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter") {
                    const inputElement = e.target as HTMLInputElement;
                    addProject(inputElement.value);
                    inputElement.value = "";
                  }
                }}
              />
              <Button
                onClick={() => {
                  const inputElement = document.getElementById("project-name") as HTMLInputElement;
                  addProject(inputElement.value);
                  inputElement.value = "";
                }}
                disabled={false}
              >
                Add
              </Button>
            </div>
            <div className="mt-4">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center justify-between mb-4 border-b pb-2">
                  <span className="text-gray-900 font-semibold flex-1">{project.name}</span>
                  <span className="text-gray-700">{formatTime(getTimerDisplay(projectTimers[project.id] || { base: 0, running: false, startedAt: null }))}</span>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      onClick={() => transferTimeProjectGeneral(project.id, true)}
                      variant="outline"
                      className="px-2"
                      title="Add 5 minutes from General Timer"
                      disabled={getTimerDisplay(general) < TIME_INCREMENT}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => transferTimeProjectGeneral(project.id, false)}
                      variant="outline"
                      className="px-2"
                      title="Remove 5 minutes to General Timer"
                      disabled={(projectTimers[project.id]?.base || 0) < TIME_INCREMENT}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => startProjectTimer(project.id)}
                      disabled={projectRunning === project.id}
                      className={`mr-2 ${projectRunning === project.id ? "bg-green-500 text-white" : ""}`}
                    >
                      Start
                    </Button>
                    <Button onClick={stopProjectTimer} disabled={projectRunning !== project.id}>
                      Stop
                    </Button>
                  </div>
                  <div className="flex justify-end ml-4">
                    <Button
                      onClick={() => deleteProject(project.id)}
                      variant="outline"
                      className="text-red-500 hover:bg-red-100 p-1 flex-shrink-0"
                      title="Delete Project"
                      disabled={false}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Export Button */}
      <Button
        onClick={exportToCSV}
        className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 mt-4"
        disabled={false}
      >
        Export to CSV
      </Button>
    </div>
  );
}
