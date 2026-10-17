
import { createContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

export const PlacementContext = createContext();

export function PlacementProvider({ children }) {
  const { user } = useAuth();
  const [placements, setPlacements] = useState([]);
  const [loadingPlacements, setLoadingPlacements] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function fetchPlacements() {
      setLoadingPlacements(true);

      try {
        const response = await fetch(
          "http://localhost:5000/api/placement",
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch placements."
          );
        }

        if (!ignore) {
          setPlacements(
            data.placements.map((placement) => ({
              ...placement,
              id: placement._id,
            }))
          );
        }
      } catch (error) {
        if (!ignore) {
          console.error("Failed to fetch placements:", error);
        }
      } finally {
        if (!ignore) {
          setLoadingPlacements(false);
        }
      }
    }

    if (user) {
      fetchPlacements();
    } else {
      setPlacements([]);
      setLoadingPlacements(false);
    }

    return () => {
      ignore = true;
    };
  }, [user]);

  return (
    <PlacementContext.Provider
      value={{ placements, setPlacements, loadingPlacements }}
    >
      {children}
    </PlacementContext.Provider>
  );
}
