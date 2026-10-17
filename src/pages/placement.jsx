import { useContext, useState } from 'react'
import { PlacementContext } from '../context/PlacementContext'
import './placement.css'
import { API_URL } from "../api/config";

function Placement() {
  const { placements, setPlacements } = useContext(PlacementContext)

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    company: "",
    role: "",
    package: "",
    driveDate: "",
    eligibility: "",
    status: "Open",
  });

  
const handleEditPlacement = (placement) => {
  setEditingId(placement.id);
  setFormData({
    company: placement.company || "",
    role: placement.role || "",
    package: placement.package || "",
    driveDate: placement.driveDate
      ? placement.driveDate.slice(0, 10)
      : "",
    eligibility: placement.eligibility || "",
    status: placement.status || "Open",
  });
  setFormError("");
  setShowForm(true);
  window.scrollTo({ top: 0, behavior: "smooth" });
};

    
const handleFormChange = (event) => {
  const { name, value } = event.target;

  setFormData((current) => ({
    ...current,
    [name]: value,
  }));
};


const handleAddPlacement = async (event) => {
  event.preventDefault();
  setFormError("");

  if (!formData.company.trim() || !formData.role.trim()) {
    setFormError("Company and role are required.");
    return;
  }

  if (
    formData.company.trim().length > 100 ||
    formData.role.trim().length > 100
  ) {
    setFormError("Company and role cannot exceed 100 characters.");
    return;
  }

  setSaving(true);

  try {
    const isEditing = editingId !== null;

    const response = await fetch(
      isEditing
        ? `${API_URL}/api/placement/${editingId}`
        : `${API_URL}/api/placement`,
      {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          company: formData.company.trim(),
          role: formData.role.trim(),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to save placement.");
    }

    if (isEditing) {
      const updatedPlacement = {
        ...data.placement,
        id: data.placement._id,
      };

      setPlacements((current) =>
        current.map((placement) =>
          placement.id === editingId ? updatedPlacement : placement
        )
      );
    } else {
      const newPlacement = {
        ...data.placement,
        id: data.placement._id,
        hasApplied: false,
        hasInterviewed: false,
      };

      setPlacements((current) => [newPlacement, ...current]);
    }

    setFormData({
      company: "",
      role: "",
      package: "",
      driveDate: "",
      eligibility: "",
      status: "Open",
    });

    setEditingId(null);
    setShowForm(false);
  } catch (error) {
    setFormError(error.message || "Unable to save placement.");
  } finally {
    setSaving(false);
  }
};


const handleStatusChange = async (id, newStatus) => {
  const currentPlacement = placements.find(
    (placement) => placement.id === id
  );

  if (!currentPlacement) return;

  const previousPlacements = placements;

  const updatedPlacement = {
    ...currentPlacement,
    status: newStatus,
    hasApplied:
      currentPlacement.hasApplied ||
      ["Applied", "Interview", "Selected", "Rejected"].includes(newStatus),
    hasInterviewed:
      currentPlacement.hasInterviewed ||
      ["Interview", "Selected", "Rejected"].includes(newStatus),
  };

  setPlacements((current) =>
    current.map((placement) =>
      placement.id === id ? updatedPlacement : placement
    )
  );

  try {
    const response = await fetch(
      `${API_URL}/api/placement/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update placement status.");
    }
  } catch (error) {
    setPlacements(previousPlacements);
    console.error("Update placement status error:", error);
    alert(error.message || "Unable to update placement status.");
  }
};


    const totalDrives = placements.length;


const appliedCount = placements.filter(
  (placement) => placement.hasApplied || ['Applied', 'Interview', 'Selected', 'Rejected'].includes(placement.status)
).length

const interviewCount = placements.filter(
  (placement) => placement.hasInterviewed || ['Interview', 'Selected', 'Rejected'].includes(placement.status)
).length

const selectedCount = placements.filter(
  (placement) => placement.status === 'Selected'
).length

const rejectedCount = placements.filter(
  (placement) => placement.status === 'Rejected'
).length


  return (
    <div className="placement-page">
      
<div className="placement-header">
  <div>
    <h1>Placement</h1>
    <p>Manage your placement preparation and opportunities.</p>
  </div>

  <button
    type="button"
    className="add-placement-btn"
    onClick={() => {
      if (showForm) {
        setShowForm(false);
        setEditingId(null);
        setFormError("");
        setFormData({
          company: "",
          role: "",
          package: "",
          driveDate: "",
          eligibility: "",
          status: "Open",
        });
      } else {
        setShowForm(true);
        setEditingId(null);
        setFormError("");
      }
    }}>
    {showForm ? "Cancel" : "+ Add Placement"}
  </button>
</div>

{showForm && (
  <form className="placement-form" onSubmit={handleAddPlacement}>
    <h2>{editingId ? "Edit Placement" : "Add New Placement"}</h2>

    <div className="placement-form-grid">
      <label>
        Company *
        <input
          name="company"
          value={formData.company}
          onChange={handleFormChange}
          maxLength={100}
          required
          placeholder="e.g. Google"
        />
      </label>

      <label>
        Role *
        <input
          name="role"
          value={formData.role}
          onChange={handleFormChange}
          maxLength={100}
          required
          placeholder="e.g. Software Engineer"
        />
      </label>

      <label>
        Package
        <input
          name="package"
          value={formData.package}
          onChange={handleFormChange}
          placeholder="e.g. 12 LPA"
        />
      </label>

      <label>
        Drive Date
        <input
          type="date"
          name="driveDate"
          value={formData.driveDate}
          onChange={handleFormChange}
        />
      </label>

      <label>
        Eligibility
        <input
          name="eligibility"
          value={formData.eligibility}
          onChange={handleFormChange}
          placeholder="e.g. 6.5 CGPA"
        />
      </label>

      <label>
        Status
        <select
          name="status"
          value={formData.status}
          onChange={handleFormChange}
        >
          <option value="Open">Open</option>
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="Selected">Selected</option>
          <option value="Rejected">Rejected</option>
        </select>
      </label>
    </div>

    {formError && (
      <p className="placement-form-error">{formError}</p>
    )}

    <div className="placement-form-actions">
  <button type="submit" disabled={saving}>
    {saving ? "Saving..." : editingId ? "Update Placement" : "Save Placement"}
  </button>

  <button
    type="button"
    className="cancel-placement-btn"
    disabled={saving}
    onClick={() => {
      setShowForm(false);
      setEditingId(null);
      setFormError("");
      setFormData({
        company: "",
        role: "",
        package: "",
        driveDate: "",
        eligibility: "",
        status: "Open",
      });
    }}
  >
    Cancel
  </button>
</div>
  </form>
)}

      <p>Manage your placement preparation and opportunities.</p>

      <div className="placement-overview">
        <div className="placement-stat">
            <h2>{totalDrives}</h2>
            <p>Total Drives</p>
        </div>

        <div className="placement-stat">
            <h2>{appliedCount}</h2>
            <p>Applied</p>
        </div>

        <div className="placement-stat">
            <h2>{interviewCount}</h2>
            <p>Interviews</p>
        </div>

        <div className="placement-stat">
            <h2>{selectedCount}</h2>
            <p>Selected</p>
        </div>

        <div className="placement-stat">
        <h2>{rejectedCount}</h2>
        <p>Rejected</p>
      </div>
     </div>

        <section className="upcoming-drives">
          <h2>Upcoming Drives</h2>
          <p>
          {placements.filter(
            (placement) =>
              placement.status === "Open" &&
              new Date(placement.driveDate) >= new Date()
          ).length} upcoming drives
        </p>

        <div className="upcoming-drive-list">
        {placements
          .filter(
            (placement) =>
              placement.status === "Open" &&
              new Date(placement.driveDate) >= new Date()
          )
          .map((placement) => (
            <div className="upcoming-drive" key={placement.id}>
              <h3>{placement.company}</h3>
              <p>{placement.role}</p>
              <p>Drive Date: {placement.driveDate}</p>
            </div>
          ))}
      </div>
        </section>

          <section className="my-applications">
          <h2>My Applications</h2>

          <p>
            {placements.filter(
              (placement) => placement.status !== "Open"
            ).length} applications
          </p>

            <div className="application-list">
            {placements
              .filter((placement) => placement.status !== "Open")
              .map((placement) => (
                <div className="application-card" key={placement.id}>
                  <h3>{placement.company}</h3>
                  <p>{placement.role}</p>
                  <p>Package: {placement.package}</p>
                  <p>Drive Date: {placement.driveDate}</p>
                  <strong>{placement.status}</strong>
                </div>
              ))}
          </div>

        </section>

        <section className="placement-opportunities">
      <h2>Available Opportunities</h2>
      <p>Explore available placement opportunities.</p>
    </section>

        <div className="placement-list">
       {placements.map((placement) => (
        <div className="placement-card" key={placement.id}>
        <h2>{placement.company}</h2>

        <p>{placement.role}</p>

        <p>Package: {placement.package}</p>

        <p>Drive Date: {placement.driveDate}</p>

        <p>Eligibility: {placement.eligibility}</p>

        <strong className={`status-${placement.status.toLowerCase()}`}>
        {placement.status}
      </strong>

      <button
      type="button"
      className="edit-placement-btn"
      onClick={() => handleEditPlacement(placement)}
    >
      Edit
    </button>
          {placement.status === "Open" && (
            <button
              type="button"
              onClick={() =>
                handleStatusChange(placement.id, "Applied")
              }
            >
              Apply Now
            </button>
          )}

          {placement.status === "Applied" && (
            <button
              type="button"
              onClick={() =>
                handleStatusChange(placement.id, "Interview")
              }
            >
              Mark Interview
            </button>
          )}

          {placement.status === "Interview" && (
            <>
              <button
                type="button"
                onClick={() =>
                  handleStatusChange(placement.id, "Selected")
                }
              >
                Mark Selected
              </button>

              <button
                type="button"
                onClick={() =>
                  handleStatusChange(placement.id, "Rejected")
                }
              >
                Mark Rejected
              </button>
            </>
          )}
        </div>
    ))}
    </div>

    </div>
  )
}

export default Placement
    

