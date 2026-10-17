import { useState } from 'react'
import './App.css'
import { Menu } from 'lucide-react'
import Tasks from './pages/Tasks'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard/Dashboard'
import Subjects from './pages/Subjects'
import Attendance from './pages/Attendance'
import Placement from './pages/placement'
import { SubjectProvider } from './context/SubjectContext'
import { TaskProvider } from './context/TaskContext'
import { AttendanceProvider } from './context/AttendanceContext'
import { PlacementProvider } from './context/PlacementContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'


function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen((previous) => !previous)
  }

  
return (
  <AuthProvider>
    <PlacementProvider>
      <SubjectProvider>
        <TaskProvider>
          <AttendanceProvider>
            <BrowserRouter>
              <Sidebar
                isOpen={sidebarOpen}
                onToggle={toggleSidebar}
              />

              {!sidebarOpen && (
                <button
                  className="sidebar-show-button"
                  onClick={toggleSidebar}
                  aria-label="Show sidebar"
                >
                  <Menu size={21} />
                </button>
              )}

              <div
                className={`app-main ${
                  sidebarOpen
                    ? 'sidebar-is-open'
                    : 'sidebar-is-closed'
                }`}
              >
                <Navbar />

                <main className="page-content">
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />


                      <Route
                        path="/"
                        element={
                          <ProtectedRoute>
                            <Dashboard
                              name="Nandini"
                              semester="3rd Semester"
                            />
                          </ProtectedRoute>
                        }
                      />

                                              
                      <Route
                        path="/subjects"
                        element={
                          <ProtectedRoute>
                            <Subjects />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/tasks"
                        element={
                          <ProtectedRoute>
                            <Tasks />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/attendance"
                        element={
                          <ProtectedRoute>
                            <Attendance />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/placement"
                        element={
                          <ProtectedRoute>
                            <Placement />
                          </ProtectedRoute>
                        }
                      />

                  </Routes>
                </main>
              </div>
            </BrowserRouter>
          </AttendanceProvider>
        </TaskProvider>
      </SubjectProvider>
    </PlacementProvider>
  </AuthProvider>
)
}

export default App