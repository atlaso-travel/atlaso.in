import type { Metadata } from "next";
import SavedContent from "@/components/home/SavedContent";
import { getAllSummaries } from "@/server/catalogue";

export const metadata: Metadata = {
  title: "Saved trips",
  robots: { index: false, follow: true },
};

export default async function SavedPage() {
  const allPackages = await getAllSummaries();
  return <SavedContent allPackages={allPackages} />;
}
