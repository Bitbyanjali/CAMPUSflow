
import { createContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { API_URL } from "../api/config";

export const AttendanceContext = createContext();

export function AttendanceProvider({ children }) {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState({});
  const [loadingAttendance, setLoadingAttendance] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function fetchAttendance() {
      setLoadingAttendance(true);

      try {
        const response = await fetch(
          `${API_URL}/api/attendance`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch attendance."
          );
        }

        const attendanceMap = {};

        data.attendance.forEach((record) => {
          attendanceMap[record.subjectId] = {
            total: String(record.totalClasses),
            attended: String(record.attendedClasses),
          };
        });

        if (!ignore) {
          setAttendance(attendanceMap);
        }
      } catch (error) {
        if (!ignore) {
          console.error("Failed to fetch attendance:", error);
        }
      } finally {
        if (!ignore) {
          setLoadingAttendance(false);
        }
      }
    }

    if (user) {
      fetchAttendance();
    } else {
      setAttendance({});
      setLoadingAttendance(false);
    }

    return () => {
      ignore = true;
    };
  }, [user]);

  return (
    <AttendanceContext.Provider
      value={{
        attendance,
        setAttendance,
        loadingAttendance,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
}
