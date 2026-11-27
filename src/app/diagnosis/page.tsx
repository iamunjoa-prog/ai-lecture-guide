import type { Metadata } from "next";
import { DiagnosisFlow } from "@/components/DiagnosisFlow";
import { DIAGNOSIS_MINUTES } from "@/lib/questions";

export const metadata: Metadata = {
  title: `${DIAGNOSIS_MINUTES}분 진단`,
};

export default function DiagnosisPage() {
  return <DiagnosisFlow />;
}
