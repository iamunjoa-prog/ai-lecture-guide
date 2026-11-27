import type { Metadata } from "next";
import { DiagnosisFlow } from "@/components/DiagnosisFlow";

export const metadata: Metadata = {
  title: "1분 진단",
};

export default function DiagnosisPage() {
  return <DiagnosisFlow />;
}
