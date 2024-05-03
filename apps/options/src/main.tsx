import { createRoot } from "react-dom/client";
import "./styles.scss";

import Root from "./app/root";

const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement); // createRoot(container!) if you use TypeScript

root.render(<Root />);
