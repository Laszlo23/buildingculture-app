import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ensureBaseAppIdMeta } from "@/seo/baseAppVerification";
import "./index.css";

ensureBaseAppIdMeta();

createRoot(document.getElementById("root")!).render(<App />);
