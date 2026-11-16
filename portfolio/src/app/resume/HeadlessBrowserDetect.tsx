"use client";

import { useEffect } from "react";

export function HeadlessBrowserDetect() {
  useEffect(() => {
    function detectHeadless(): boolean {
      // navigator.webdriver is set by Puppeteer/Playwright
      if (navigator.webdriver) return true;

      // Check for missing Chrome runtime (Puppeteer often lacks this)
      if (typeof window !== "undefined") {
        const winWithChrome = window as { chrome?: { runtime?: unknown } };
        if (!winWithChrome.chrome?.runtime) {
          // This alone isn't definitive, but combined with other signals it's useful
        }
      }

      // Canvas fingerprinting: headless browsers may have different canvas behavior
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.textBaseline = "top";
        ctx.font = "14px Arial";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.fillText("Browser fingerprint test", 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.fillText("Browser fingerprint test", 4, 17);

        const canvasData = canvas.toDataURL();
        // Headless browsers may produce consistent/predictable canvas data
        if (canvasData.includes("data:image/png") && canvasData.length < 100) {
          return true;
        }
      }

      // Check WebGL renderer (headless browsers may expose ANGLE or SwiftShader)
      const glCanvas = document.createElement("canvas");
      const gl = glCanvas.getContext("webgl");
      if (gl) {
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          if (renderer && renderer.includes("SwiftShader")) {
            return true;
          }
        }
      }

      // Check for headless-specific window properties
      if (Object.getOwnPropertyDescriptor(navigator, "plugins")?.get?.toString().includes("native code") === false) {
        return true;
      }

      // Chrome headless user-agent detection
      if (navigator.userAgent.includes("HeadlessChrome")) {
        return true;
      }

      return false;
    }

    const isHeadless = detectHeadless();
    if (isHeadless) {
      // Log the detection server-side for monitoring
      fetch("/api/log-headless-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timestamp: new Date().toISOString() }),
      }).catch(() => {
        // Fail silently
      });

      // Optionally block or warn (commented out to avoid breaking legitimate use)
      // console.warn("Headless browser detected");
    }
  }, []);

  return null;
}
