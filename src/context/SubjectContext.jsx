
import { createContext, useState, useEffect } from "react";
import { subjects as initialSubjects } from "../data/subjects";
import { useAuth } from "./AuthContext";
import { API_URL } from "../api/config";

export const SubjectContext = createContext();

export function SubjectProvider({ children }) {
  const { user } = useAuth();
  const [subjectList, setSubjectList] = useState(() => {
    try {
      const savedSubjects = localStorage.getItem("subjects");

      return savedSubjects
        ? JSON.parse(savedSubjects)
        : initialSubjects;
    } catch (error) {
      console.error("Failed to load subjects:", error);
      return initialSubjects;
    }
  });

  
  useEffect(() => {
    let ignore = false;

    async function fetchSubjects() {
      try {
        const response = await fetch(
          `${API_URL}/api/subjects`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch subjects."
          );
        }

        if (!ignore) {
          setSubjectList(
            data.subjects.map((subject) => ({
              ...subject,
              id: subject._id,
            }))
          );
        }
      } catch (error) {
        if (!ignore) {
          console.error("Failed to fetch subjects:", error);
        }
      }
    }

    if (user) {
      fetchSubjects();
    }

    return () => {
      ignore = true;
    };
  }, [user]);

  return (
    <SubjectContext.Provider
      value={{
        subjectList,
        setSubjectList,
      }}
    >
      {children}
    </SubjectContext.Provider>
  );
}

