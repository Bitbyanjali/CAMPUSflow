import { useState, useContext} from 'react'
import TaskCard from '../components/TaskCard'
import './Tasks.css'
import { SubjectContext } from '../context/SubjectContext'
import { TaskContext } from '../context/TaskContext'
import { API_URL } from "../api/config";


function Tasks() {
  const [taskError, setTaskError] = useState('')
  const { subjectList } = useContext(SubjectContext)
  const { taskList, setTaskList, loadingTasks } = useContext(TaskContext)

  const [showForm, setShowForm] = useState(false)

  const [newTask, setNewTask] = useState({
    title: '',
    subject: '',
    dueDate: '',
  })

  
const toggleTask = async (id) => {
  const task = taskList.find((item) => item.id === id);

  if (!task) return;

  setTaskError('');

  try {
    const response = await fetch(
      `${API_URL}/api/tasks/${id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          completed: !task.completed,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || 'Failed to update task.'
      );
    }

    setTaskList((prevTasks) =>
      prevTasks.map((item) =>
        item.id === id
          ? {
              ...item,
              completed: data.task.completed,
            }
          : item
      )
    );
  } catch (error) {
    setTaskError(
      error.message || 'Unable to update task.'
    );
  }
};


const deleteTask = async (id) => {
  setTaskError('');

  try {
    const response = await fetch(
      `${API_URL}/api/tasks/${id}`,
      {
        method: 'DELETE',
        credentials: 'include',
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || 'Failed to delete task.'
      );
    }

    setTaskList((prevTasks) =>
      prevTasks.filter((task) => task.id !== id)
    );
  } catch (error) {
    setTaskError(
      error.message || 'Unable to delete task.'
    );
  }
};


const handleInputChange = (e) => {
  const { name, value } = e.target;

  setNewTask((prevTask) => ({
    ...prevTask,
    [name]: value,
  }));
};

  
const addTask = async (e) => {
  e.preventDefault();

  if (
    !newTask.title.trim() ||
    !newTask.subject.trim() ||
    !newTask.dueDate.trim()
  ) {
    return;
  }

  setTaskError('');

  try {
    const response = await fetch(
      `${API_URL}/api/tasks`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: newTask.title.trim(),
          subject: newTask.subject,
          dueDate: newTask.dueDate.trim(),
          completed: false,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || 'Failed to create task.'
      );
    }

    const savedTask = {
      ...data.task,
      id: data.task._id,
    };

    setTaskList((prevTasks) => [
      savedTask,
      ...prevTasks,
    ]);

    setNewTask({
      title: '',
      subject: '',
      dueDate: '',
    });

    setShowForm(false);
  } catch (error) {
    setTaskError(
      error.message || 'Unable to create task.'
    );
  }
};


  const completedTasks = taskList.filter(
    (task) => task.completed
  ).length

  const pendingTasks = taskList.filter(
    (task) => !task.completed
  ).length

    return (
      <div className="tasks-page">
        {loadingTasks && <p>Loading tasks...</p>}

        {!loadingTasks && taskError && (
          <p role="alert">{taskError}</p>
        )}

      {/* Header */}
      <div className="tasks-header">

        <div>
          <span className="tasks-label">
            TASK MANAGEMENT
          </span>

          <h1>My Tasks</h1>

          <p>
            Keep track of your assignments, projects
            and academic work.
          </p>
        </div>

        <button
          className="add-task-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '× Close' : '+ Add Task'}
        </button>

      </div>


      {/* Add Task Form */}
      {showForm && (
        <form
          className="add-task-form"
          onSubmit={addTask}
        >

          <div className="form-group">

            <label>Task Title</label>

            <input
              type="text"
              name="title"
              placeholder="Enter task title"
              value={newTask.title}
              onChange={handleInputChange}
            />

          </div>


          <div className="form-group">

            <label>Subject</label>

            <select
              name="subject"
              value={newTask.subject}
              onChange={handleInputChange}
            >

              <option value="">
                Select subject
              </option>

              {subjectList.map((subject) => (
                <option
                  key={subject.id}
                  value={subject.name}
                >
                  {subject.name}
                </option>
              ))}

            </select>

          </div>


          <div className="form-group">

            <label>Due Date</label>

            <input
              type="text"
              name="dueDate"
              placeholder="e.g. Tomorrow"
              value={newTask.dueDate}
              onChange={handleInputChange}
            />

          </div>


          <button
            type="submit"
            className="save-task-button"
          >
            Add Task
          </button>

        </form>
      )}


      {/* Summary */}
      <div className="tasks-summary">

        <div className="task-summary-card">
          <span>Total Tasks</span>
          <strong>{taskList.length}</strong>
        </div>

        <div className="task-summary-card">
          <span>Completed</span>
          <strong>{completedTasks}</strong>
        </div>

        <div className="task-summary-card">
          <span>Pending</span>
          <strong>{pendingTasks}</strong>
        </div>

      </div>


      {/* All Tasks */}
      <section className="all-tasks">

        <div className="section-heading">

          <div>
            <h2>All Tasks</h2>

            <p>
              Manage your academic tasks
            </p>
          </div>

        </div>


        <div className="tasks-grid">

          {taskList.length > 0 ? (

            taskList.map((task) => (

              <TaskCard
                key={task.id}
                title={task.title}
                subject={task.subject}
                dueDate={task.dueDate}
                completed={task.completed}
                taskId={task.id}
                onToggle={toggleTask}
                onDelete={deleteTask}
              />

            ))

          ) : (

            <div className="empty-tasks">

              <div>✓</div>

              <h3>No tasks left</h3>

              <p>
                You are all caught up!
              </p>

            </div>

          )}

        </div>

      </section>

    </div>
  )
}

export default Tasks