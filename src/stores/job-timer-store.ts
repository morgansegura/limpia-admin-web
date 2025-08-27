import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { differenceInMinutes } from 'date-fns';

// Types (matching the existing interfaces)
export interface JobTask {
  id: string;
  name: string;
  description: string;
  estimatedTime: number; // minutes
  actualTime?: number; // minutes
  startTime?: Date;
  endTime?: Date;
  status: "pending" | "in_progress" | "completed" | "skipped";
  difficulty: "easy" | "medium" | "hard";
  priority: "low" | "medium" | "high";
  location: string; // room/area
  notes?: string;
  issues?: string[];
}

export interface JobTimer {
  id: string;
  workerId: string;
  jobId: string;
  customerName: string;
  serviceType: string;
  propertyType: "residential" | "commercial" | "office" | "retail";
  propertySize: {
    sqft?: number;
    bedrooms?: number;
    bathrooms?: number;
    floors?: number;
  };
  tasks: JobTask[];
  startTime?: Date;
  endTime?: Date;
  totalDuration: number; // minutes
  status: "not_started" | "in_progress" | "paused" | "completed" | "cancelled";
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  estimatedDuration: number; // minutes
  actualDuration?: number; // minutes
  breaks: {
    start: Date;
    end?: Date;
    reason: string;
    duration: number;
  }[];
  photos: {
    id: string;
    url: string;
    caption: string;
    timestamp: Date;
    type: "before" | "during" | "after" | "issue";
  }[];
  notes: string;
  qualityScore?: number;
  customerFeedback?: string;
  completionChecklist: {
    item: string;
    completed: boolean;
    timestamp?: Date;
  }[];
}

interface JobTimerState {
  // State
  jobTimers: JobTimer[];
  currentTime: Date;
  
  // Actions
  setJobTimers: (timers: JobTimer[]) => void;
  updateCurrentTime: () => void;
  
  // Timer actions
  startTimer: (timerId: string) => void;
  pauseTimer: (timerId: string) => void;
  completeTimer: (timerId: string) => void;
  
  // Task actions
  startTask: (timerId: string, taskId: string) => void;
  completeTask: (timerId: string, taskId: string) => void;
  updateTask: (timerId: string, taskId: string, updates: Partial<JobTask>) => void;
  
  // Utility functions
  getActiveTimers: () => JobTimer[];
  getTimerById: (id: string) => JobTimer | undefined;
  getTotalElapsedTime: (timer: JobTimer) => number;
  getCurrentTaskDuration: (timer: JobTimer) => number;
  
  // Statistics
  getTimerStats: () => {
    activeTimers: number;
    completedToday: number;
    avgEfficiency: number;
    totalTimeSaved: number;
    onTimeRate: number;
  };
}

export const useJobTimerStore = create<JobTimerState>()(
  persist(
    (set, get) => ({
      // Initial state
      jobTimers: [],
      currentTime: new Date(),

      // Basic setters
      setJobTimers: (timers) => set({ jobTimers: timers }),
      updateCurrentTime: () => set({ currentTime: new Date() }),

      // Timer actions
      startTimer: (timerId) => {
        set((state) => ({
          jobTimers: state.jobTimers.map((timer) => {
            if (timer.id === timerId) {
              return {
                ...timer,
                status: "in_progress" as const,
                startTime: new Date(),
              };
            }
            return timer;
          }),
        }));
      },

      pauseTimer: (timerId) => {
        set((state) => ({
          jobTimers: state.jobTimers.map((timer) => {
            if (timer.id === timerId) {
              return {
                ...timer,
                status: "paused" as const,
              };
            }
            return timer;
          }),
        }));
      },

      completeTimer: (timerId) => {
        const state = get();
        const timer = state.jobTimers.find((t) => t.id === timerId);
        if (!timer) return;

        const actualDuration = timer.startTime
          ? differenceInMinutes(new Date(), timer.startTime)
          : 0;

        set((state) => ({
          jobTimers: state.jobTimers.map((t) => {
            if (t.id === timerId) {
              return {
                ...t,
                status: "completed" as const,
                endTime: new Date(),
                actualDuration,
                tasks: t.tasks.map((task) => ({
                  ...task,
                  status: task.status === "in_progress" 
                    ? ("completed" as const) 
                    : task.status,
                })),
              };
            }
            return t;
          }),
        }));
      },

      // Task actions
      startTask: (timerId, taskId) => {
        set((state) => ({
          jobTimers: state.jobTimers.map((timer) => {
            if (timer.id === timerId) {
              return {
                ...timer,
                tasks: timer.tasks.map((task) => {
                  if (task.id === taskId) {
                    return {
                      ...task,
                      status: "in_progress" as const,
                      startTime: new Date(),
                    };
                  }
                  // Pause other in-progress tasks
                  if (task.status === "in_progress") {
                    return {
                      ...task,
                      status: "pending" as const,
                    };
                  }
                  return task;
                }),
              };
            }
            return timer;
          }),
        }));
      },

      completeTask: (timerId, taskId) => {
        const state = get();
        const timer = state.jobTimers.find((t) => t.id === timerId);
        const task = timer?.tasks.find((t) => t.id === taskId);
        if (!timer || !task) return;

        const actualTime = task.startTime
          ? differenceInMinutes(new Date(), task.startTime)
          : 0;

        set((state) => ({
          jobTimers: state.jobTimers.map((t) => {
            if (t.id === timerId) {
              return {
                ...t,
                tasks: t.tasks.map((tsk) => {
                  if (tsk.id === taskId) {
                    return {
                      ...tsk,
                      status: "completed" as const,
                      endTime: new Date(),
                      actualTime,
                    };
                  }
                  return tsk;
                }),
              };
            }
            return t;
          }),
        }));
      },

      updateTask: (timerId, taskId, updates) => {
        set((state) => ({
          jobTimers: state.jobTimers.map((timer) => {
            if (timer.id === timerId) {
              return {
                ...timer,
                tasks: timer.tasks.map((task) => {
                  if (task.id === taskId) {
                    return { ...task, ...updates };
                  }
                  return task;
                }),
              };
            }
            return timer;
          }),
        }));
      },

      // Utility functions
      getActiveTimers: () => {
        return get().jobTimers.filter((timer) => timer.status === "in_progress");
      },

      getTimerById: (id) => {
        return get().jobTimers.find((timer) => timer.id === id);
      },

      getTotalElapsedTime: (timer) => {
        if (!timer.startTime) return 0;
        const { currentTime } = get();
        const elapsed = differenceInMinutes(currentTime, timer.startTime);
        const breakTime = timer.breaks.reduce((sum, b) => sum + b.duration, 0);
        return elapsed - breakTime;
      },

      getCurrentTaskDuration: (timer) => {
        const { currentTime } = get();
        const currentTask = timer.tasks.find((t) => t.status === "in_progress");
        if (!currentTask || !currentTask.startTime) return 0;
        return differenceInMinutes(currentTime, currentTask.startTime);
      },

      // Statistics
      getTimerStats: () => {
        const { jobTimers } = get();
        
        const activeTimers = jobTimers.filter(
          (t) => t.status === "in_progress",
        ).length;
        
        const completedToday = jobTimers.filter(
          (t) =>
            t.status === "completed" &&
            t.endTime &&
            t.endTime.toDateString() === new Date().toDateString(),
        ).length;

        const avgEfficiency =
          jobTimers
            .filter((t) => t.actualDuration && t.estimatedDuration)
            .reduce((sum, t) => {
              const efficiency = (t.estimatedDuration / t.actualDuration!) * 100;
              return sum + Math.min(efficiency, 150); // Cap at 150%
            }, 0) / jobTimers.filter((t) => t.actualDuration).length || 0;

        const totalTimeSaved = jobTimers
          .filter((t) => t.actualDuration && t.estimatedDuration)
          .reduce((sum, t) => sum + (t.estimatedDuration - t.actualDuration!), 0);

        const onTimeJobs = jobTimers.filter(
          (t) => t.actualDuration && t.actualDuration <= t.estimatedDuration,
        ).length;

        const completedJobs = jobTimers.filter((t) => t.actualDuration).length;
        const onTimeRate =
          completedJobs > 0 ? (onTimeJobs / completedJobs) * 100 : 0;

        return {
          activeTimers,
          completedToday,
          avgEfficiency,
          totalTimeSaved,
          onTimeRate,
        };
      },
    }),
    {
      name: 'job-timer-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist essential data, not computed values
      partialize: (state) => ({
        jobTimers: state.jobTimers.map(timer => ({
          ...timer,
          // Convert Date objects to strings for persistence
          startTime: timer.startTime?.toISOString(),
          endTime: timer.endTime?.toISOString(),
          tasks: timer.tasks.map(task => ({
            ...task,
            startTime: task.startTime?.toISOString(),
            endTime: task.endTime?.toISOString(),
          })),
          breaks: timer.breaks.map(breakItem => ({
            ...breakItem,
            start: breakItem.start.toISOString(),
            end: breakItem.end?.toISOString(),
          })),
          photos: timer.photos.map(photo => ({
            ...photo,
            timestamp: photo.timestamp.toISOString(),
          })),
          completionChecklist: timer.completionChecklist.map(item => ({
            ...item,
            timestamp: item.timestamp?.toISOString(),
          })),
        })),
      }),
      // Rehydrate Date objects when loading from storage
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.jobTimers = state.jobTimers.map(timer => ({
            ...timer,
            startTime: timer.startTime ? new Date(timer.startTime as string | Date) : undefined,
            endTime: timer.endTime ? new Date(timer.endTime as string | Date) : undefined,
            tasks: timer.tasks.map(task => ({
              ...task,
              startTime: task.startTime ? new Date(task.startTime as string | Date) : undefined,
              endTime: task.endTime ? new Date(task.endTime as string | Date) : undefined,
            })),
            breaks: timer.breaks.map(breakItem => ({
              ...breakItem,
              start: new Date(breakItem.start as string | Date),
              end: breakItem.end ? new Date(breakItem.end as string | Date) : undefined,
            })),
            photos: timer.photos.map(photo => ({
              ...photo,
              timestamp: new Date(photo.timestamp as string | Date),
            })),
            completionChecklist: timer.completionChecklist.map(item => ({
              ...item,
              timestamp: item.timestamp ? new Date(item.timestamp as string | Date) : undefined,
            })),
          }));
          state.currentTime = new Date();
        }
      },
    }
  )
);