import { Routes, Route, Navigate } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<div>Login Page</div>} />
      <Route path="/record" element={<div>Record Page</div>} />
      <Route path="/record/:id" element={<div>Record Detail Page</div>} />
      <Route path="/stats" element={<div>Stats Page</div>} />
      <Route path="/" element={<Navigate to="/record" replace />} />
    </Routes>
  )
}

export default App