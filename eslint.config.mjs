import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // sessionStorage 복원·IntersectionObserver 폴백은 하이드레이션 이후 한 번 setState 하는
      // 의도된 패턴이다. (useSyncExternalStore 전환은 별도 리팩터링 과제)
      "react-hooks/set-state-in-effect": "off",
    },
  },
  globalIgnores(["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
