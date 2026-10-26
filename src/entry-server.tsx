import { renderToString } from "react-dom/server";
import App from "./App";
import { pageMeta, structuredData } from "./seo";

export function renderPage(path: string) {
  return {
    html: renderToString(<App path={path} />),
    meta: pageMeta(path),
    structuredData: structuredData(path),
  };
}
