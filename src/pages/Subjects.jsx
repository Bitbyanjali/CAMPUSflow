import { useState, useContext } from "react";
import "./Subjects.css";
import { SubjectContext } from "../context/SubjectContext";
import { API_URL } from "../api/config";

function Subjects() {
  const { subjectList, setSubjectList } = useContext(SubjectContext);

  const [newSubject, setNewSubject] = useState({
  name: "",
  code: "",
  });

  const [showForm, setShowForm] = useState(false);

  const [editingSubjectId, setEditingSubjectId] = useState(null);

  
const addSubject = async () => {
  if (!newSubject.name.trim() || !newSubject.code.trim()) {
    alert("Please enter subject name and code");
    return;
  }

  try {
    
if (editingSubjectId !== null) {
  const response = await fetch(
    `${API_URL}/api/subjects/${editingSubjectId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name: newSubject.name.trim(),
        code: newSubject.code.trim(),
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update subject.");
  }

  const updatedSubject = {
    ...data.subject,
    id: data.subject._id,
  };

  setSubjectList((prevSubjects) =>
    prevSubjects.map((subject) =>
      subject.id === editingSubjectId
        ? updatedSubject
        : subject
    )
  );

  setNewSubject({ name: "", code: "" });
  setEditingSubjectId(null);
  setShowForm(false);
  return;
}


    const response = await fetch(
      `${API_URL}/api/subjects`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: newSubject.name.trim(),
          code: newSubject.code.trim(),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to add subject.");
    }

    const savedSubject = {
      ...data.subject,
      id: data.subject._id,
    };

    setSubjectList((prevSubjects) => [
      ...prevSubjects,
      savedSubject,
    ]);

    setNewSubject({ name: "", code: "" });
    setEditingSubjectId(null);
    setShowForm(false);
  } catch (error) {
    console.error("Add subject error:", error);
    alert(error.message || "Unable to add subject.");
  }
};


  
const deleteSubject = async (id) => {
  try {
    const response = await fetch(
      `${API_URL}/api/subjects/${id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to delete subject."
      );
    }

    setSubjectList((prevSubjects) =>
      prevSubjects.filter((subject) => subject.id !== id)
    );
  } catch (error) {
    console.error("Delete subject error:", error);
    alert(error.message || "Unable to delete subject.");
  }
};


const editSubject = (id) => {
  const subject = subjectList.find(
    (subject) => subject.id === id
  );

  setNewSubject({
    name: subject.name,
    code: subject.code,
  });

  setEditingSubjectId(id);
  setShowForm(true);
};

  return (
    <div  className="subjects-page">
      <h1>My Subjects</h1>

      <button onClick={() => setShowForm(true)}>
        Add Subject
        </button>

    {showForm && (
    <div className="subject-form">
        <input
        type="text"
        placeholder="Subject name"
        value={newSubject.name}
        onChange={(e) =>
          setNewSubject({
            ...newSubject,
            name: e.target.value,
          })
        }
      />
        <input
        type="text"
        placeholder="Subject code"
        value={newSubject.code}
        onChange={(e) =>
          setNewSubject({
            ...newSubject,
            code: e.target.value,
          })
        }
      />

        <button
          className="form-submit-button"
          onClick={addSubject}
        >
          {editingSubjectId !== null ? "Update Subject" : "Add Subject"}
        </button>

        <button
          className="form-cancel-button"
          onClick={() => {
            setNewSubject({
              name: "",
              code: "",
            });
            setEditingSubjectId(null);
            setShowForm(false);
          }}
        >
          Cancel
        </button>
      </div>
    )}

      {subjectList.map((subject) => (
       <div className="subject-item" key={subject.id}>
          <h2>{subject.name}</h2>
          <p>{subject.code}</p>

          <button
           className="delete-button"
            onClick={() => deleteSubject(subject.id)}>
            Delete
          </button>

          <button 
           className="edit-button"
           onClick={() => editSubject(subject.id)}>
            Edit
          </button>

        </div>
      ))}
     
    </div>
  );
}

export default Subjects