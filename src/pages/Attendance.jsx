import { useState, useContext, useEffect } from "react";
import "./Attendance.css";
import { SubjectContext } from "../context/SubjectContext";
import { AttendanceContext } from "../context/AttendanceContext";

function Attendance() {
    const { subjectList } = useContext(SubjectContext);

    const { attendance, setAttendance } = useContext(AttendanceContext);
    const saveAttendance = async (subjectId, values) => {
  if (
    values.total === "" ||
    values.attended === "" ||
    Number(values.total) < 0 ||
    Number(values.attended) < 0 ||
    Number(values.attended) > Number(values.total) ||
    !Number.isInteger(Number(values.total)) ||
    !Number.isInteger(Number(values.attended))
  ) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5000/api/attendance/${subjectId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          totalClasses: Number(values.total),
          attendedClasses: Number(values.attended),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to save attendance.");
    }
  } catch (error) {
    console.error("Save attendance error:", error);
  }
};

  return (
    <div className="attendance-page">
      <h1>Attendance</h1>

    <p className="attendance-description">
      Track your attendance subject-wise and stay on top of your classes.
    </p>

    <div className="attendance-grid">
      {subjectList.map((subject) => {
        const subjectAttendance = attendance[subject.id] || {
          total: "",
          attended: "",
        };

        const isInvalid =
          subjectAttendance.attended !== "" &&
          subjectAttendance.total !== "" &&
          Number(subjectAttendance.attended) >
            Number(subjectAttendance.total);

        const percentage =
          subjectAttendance.total > 0 && !isInvalid
            ? (Number(subjectAttendance.attended) /
                Number(subjectAttendance.total)) *
              100
            : 0;

        return (
          <div className="attendance-card" key={subject.id}>
            <h2>{subject.name}</h2>
            <p>{subject.code}</p>

            <input
              type="number"
              placeholder="Total classes"
              value={subjectAttendance.total}
              onChange={(e) => {
              const updatedValues = {
                ...subjectAttendance,
                total: e.target.value,
              };

              setAttendance((prev) => ({
                ...prev,
                [subject.id]: updatedValues,
              }));

              if (
                updatedValues.total !== "" &&
                updatedValues.attended !== "" &&
                Number(updatedValues.total) >= Number(updatedValues.attended) &&
                Number.isInteger(Number(updatedValues.total)) &&
                Number.isInteger(Number(updatedValues.attended)) &&
                Number(updatedValues.total) >= 0 &&
                Number(updatedValues.attended) >= 0
              ) {
                saveAttendance(subject.id, updatedValues);
              }
            }}
            />

            <input
              type="number"
              placeholder="Classes attended"
              value={subjectAttendance.attended}
              onChange={(e) => {
                const updatedValues = {
                  ...subjectAttendance,
                  attended: e.target.value,
                };

                setAttendance((prev) => ({
                  ...prev,
                  [subject.id]: updatedValues,
                }));

                if (
                  updatedValues.total !== "" &&
                  updatedValues.attended !== "" &&
                  Number(updatedValues.attended) <= Number(updatedValues.total) &&
                  Number(updatedValues.total) >= 0 &&
                  Number(updatedValues.attended) >= 0 &&
                  Number.isInteger(Number(updatedValues.total)) &&
                  Number.isInteger(Number(updatedValues.attended))
                ) {
                  saveAttendance(subject.id, updatedValues);
                }
              }}
            />

            {isInvalid && (
              <p>
                Attended classes cannot be greater than total classes.
              </p>
            )}

            {!isInvalid && (
            <div className="attendance-percentage">
                <span>Attendance</span>
                <strong>{percentage.toFixed(2)}%</strong>
            </div>
            )}
          </div>
        );
      })}
     </div>
    </div>
  );
}

export default Attendance;