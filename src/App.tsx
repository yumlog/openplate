import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Layout } from "@/components/layout"
import { HomePage, MapPage, TimelinePage, CoveragePage } from "@/pages"

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/coverage" element={<CoveragePage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
