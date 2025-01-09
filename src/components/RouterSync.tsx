import React from "react";
import { useLocation } from "react-router-dom";
import { useCtx } from "@reatom/npm-react";
import { updateFromSource, urlAtom } from "@reatom/url";

export const RouterSync = () => {
  const ctx = useCtx();
  const setupRef = React.useRef(false);

  // Subscribe to location changes
  useLocation();
  const currentHash = location.hash.slice(1); // Get hash without the '#' character

  if (ctx.get(urlAtom).href !== currentHash && setupRef.current) {
    // Update from source, focus on hash instead of full href
    updateFromSource(ctx, new URL(currentHash, location.origin));
  }

  if (!setupRef.current) {
    setupRef.current = true;

    urlAtom.settingsAtom(ctx, {
      init: () => new URL(currentHash || "/", location.origin), // Default to "/" if hash is empty
      sync: (_ctx, url, replace) => {
        const newHash = `#${url.pathname}${url.search}`;
        if (replace) {
          location.replace(newHash);
        } else {
          location.hash = newHash;
        }
      },
    });

    // Trigger `onChange` hooks.
    urlAtom(ctx, new URL(currentHash || "/", location.origin));
  }

  return null;
};
