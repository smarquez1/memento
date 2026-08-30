import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./styles.css"

function App() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto flex min-h-screen w-full max-w-xl items-center justify-center px-6">
        <div className="text-center">
          <p className="mb-2 text-sm uppercase tracking-[0.24em] text-neutral-500">Memento</p>
          <h1 className="text-3xl font-medium tracking-tight">A calmer way to get things done.</h1>
        </div>
      </div>
    </main>
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
