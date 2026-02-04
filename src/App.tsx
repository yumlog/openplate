import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Layout } from "@/components/layout"
import { HomePage, MapPage, TimelinePage, CoveragePage, RoiLabelingPage, ReferenceBuilderPage, RoiEditorPage } from "@/pages"

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/coverage" element={<CoveragePage />} />
          <Route path="/roi-labeling" element={<RoiLabelingPage />} />
          <Route path="/reference-builder" element={<ReferenceBuilderPage />} />
          <Route path="/roi-editor" element={<RoiEditorPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
