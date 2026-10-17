
import { createContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

export const TaskContext = createContext();

export function TaskProvider({ children }) {
  const { user } = useAuth();
  const [taskList, setTaskList] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function fetchTasks() {
      setLoadingTasks(true);

      try {
        const response = await fetch(
          "http://localhost:5000/api/tasks",
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch tasks.");
        }

        if (!ignore) {
          setTaskList(
            data.tasks.map((task) => ({
              ...task,
              id: task._id,
            }))
          );
        }
      } catch (error) {
        if (!ignore) {
          console.error("Failed to fetch tasks:", error);
        }
      } finally {
        if (!ignore) {
          setLoadingTasks(false);
        }
      }
    }

    if (user) {
      fetchTasks();
    } else {
      setTaskList([]);
      setLoadingTasks(false);
    }

    return () => {
      ignore = true;
    };
  }, [user]);

  return (
    <TaskContext.Provider
      value={{ taskList, setTaskList, loadingTasks }}
    >
      {children}
    </TaskContext.Provider>
  );
}
