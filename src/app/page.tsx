"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Removed unused import: import { format } from "date-fns";
import { Clock, Trash, Plus, Minus } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

// Define the Project interface with id as a string
interface Project {
  id: string;
  name: string;
  time: number;
}

export default function TimeTracker() {
  const [generalTimer, setGeneralTimer] = useState(0);
  const [generalTimerRunning, setGeneralTimerRunning] = useState(false);

  const [dayTimer, setDayTimer] = useState(0);
  const [dayTimerRunning, setDayTimerRunning] = useState(false);

  // Update the projects state to use the Project interface
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectTimers, setProjectTimers] = useState<{ [key: string]: number }>({});
  const [projectRunning, setProjectRunning] = useState<string | null>(null);

  // Time adjustment increment in seconds (5 minutes)
  const TIME_INCREMENT = 300;

  // Timer Effects
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (generalTimerRunning) {
      interval = setInterval(() => {
        setGeneralTimer((prevTime) => prevTime + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [generalTimerRunning]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (dayTimerRunning) {
      interval = setInterval(() => {
        setDayTimer((prevTime) => prevTime + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [dayTimerRunning]);

  useEffect(() => {
    const projectIntervals: { [key: string]: NodeJS.Timeout } = {};

    if (projectRunning !== null) {
      projectIntervals[projectRunning] = setInterval(() => {
        setProjectTimers((prevTimers) => ({
          ...prevTimers,
          [projectRunning]: (prevTimers[projectRunning] || 0) + 1,
        }));
      }, 1000);
    }

    return () => {
      Object.values(projectIntervals).forEach((interval) => clearInterval(interval));
    };
  }, [projectRunning]);

  // Time Transfer Functions
  const transferTimeGeneralDay = (adding: boolean) => {
    if (adding) {
      // Adding 5 minutes to both General Timer and Day Timer
      setGeneralTimer((prev) => prev + TIME_INCREMENT);
      setDayTimer((prev) => prev + TIME_INCREMENT);
    } else {
      // Subtracting 5 minutes from both General Timer and Day Timer
      if (generalTimer >= TIME_INCREMENT && dayTimer >= TIME_INCREMENT) {
        setGeneralTimer((prev) => prev - TIME_INCREMENT);
        setDayTimer((prev) => prev - TIME_INCREMENT);
      }
    }
  };

  const transferTimeProjectGeneral = (projectId: string, adding: boolean) => {
    if (adding) {
      // Adding to Project Timer, subtracting from General Timer
      if (generalTimer >= TIME_INCREMENT) {
        setProjectTimers((prev) => ({
          ...prev,
          [projectId]: (prev[projectId] || 0) + TIME_INCREMENT,
        }));
        setGeneralTimer((prev) => prev - TIME_INCREMENT);
      }
    } else {
      // Subtracting from Project Timer, adding to General Timer
      if (projectTimers[projectId] >= TIME_INCREMENT) {
        setProjectTimers((prev) => ({
          ...prev,
          [projectId]: prev[projectId] - TIME_INCREMENT,
        }));
        setGeneralTimer((prev) => prev + TIME_INCREMENT);
      }
    }
  };

  // Helper Functions
  const startDayTimer = () => {
    setDayTimerRunning(true);
    if (!projectRunning) {
      setGeneralTimerRunning(true);
    }
  };

  const stopDayTimer = () => {
    setDayTimerRunning(false);
    setGeneralTimerRunning(false);
    setProjectRunning(null);
  };

  const startGeneralTimer = () => {
    setGeneralTimerRunning(true);
    setProjectRunning(null);
    setDayTimerRunning(true);
  };

  const stopGeneralTimer = () => {
    setGeneralTimerRunning(false);
    setDayTimerRunning(false);
  };

  const startProjectTimer = (projectId: string) => {
    setProjectRunning(projectId);
    setGeneralTimerRunning(false);
    setDayTimerRunning(true);
  };

  const stopProjectTimer = () => {
    setProjectRunning(null);
    setGeneralTimerRunning(true);
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
      setProjectTimers((prevTimers) => ({ ...prevTimers, [newProject.id]: 0 }));
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
      ["Day Timer", formatTime(dayTimer)],
      ["General Timer", formatTime(generalTimer)],
      ...projects.map((project) => [
        `Project: ${project.name}`,
        formatTime(projectTimers[project.id] || 0),
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
                {formatTime(dayTimer)}
              </div>
              <div>
                <Button
                  onClick={startDayTimer}
                  disabled={dayTimerRunning}
                  className={`mr-2 ${dayTimerRunning ? "bg-green-500 text-white" : ""}`}
                >
                  Start
                </Button>
                <Button onClick={stopDayTimer} disabled={!dayTimerRunning} className="mr-2">
                  Stop
                </Button>
                <Button onClick={() => setDayTimer(0)} variant="outline" disabled={false}>
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
                {formatTime(generalTimer)}
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
                  disabled={generalTimer < TIME_INCREMENT || dayTimer < TIME_INCREMENT}
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
                  disabled={generalTimerRunning}
                  className={`mr-2 ${generalTimerRunning ? "bg-green-500 text-white" : ""}`}
                >
                  Start
                </Button>
                <Button onClick={stopGeneralTimer} disabled={!generalTimerRunning} className="mr-2">
                  Stop
                </Button>
                <Button
                  onClick={() => setGeneralTimer(0)}
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
                  <span className="text-gray-700">{formatTime(projectTimers[project.id] || 0)}</span>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      onClick={() => transferTimeProjectGeneral(project.id, true)}
                      variant="outline"
                      className="px-2"
                      title="Add 5 minutes from General Timer"
                      disabled={generalTimer < TIME_INCREMENT}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => transferTimeProjectGeneral(project.id, false)}
                      variant="outline"
                      className="px-2"
                      title="Remove 5 minutes to General Timer"
                      disabled={(projectTimers[project.id] || 0) < TIME_INCREMENT}
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
