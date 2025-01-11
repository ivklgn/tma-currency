import { useLaunchParams, miniApp, useSignal } from "@telegram-apps/sdk-react";
import { AppRoot } from "@telegram-apps/telegram-ui";
import { Navigate, Route, Routes, HashRouter } from "react-router-dom";
import { RouterSync } from "./RouterSync.tsx";

import { routes } from "@/routes.tsx";

export function App() {
  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);

  return (
    <AppRoot appearance={isDark ? "dark" : "light"} platform={["macos", "ios"].includes(lp.platform) ? "ios" : "base"}>
      <HashRouter>
        <RouterSync />
        <Routes>
          {routes.map((route) => (
            <Route key={route.path} {...route} />
          ))}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </HashRouter>
    </AppRoot>
  );
}
