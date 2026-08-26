import type { Metadata } from "next";
import HomeClient from "../home-client";

export const metadata: Metadata = {
  title: "VibeLab Classic",
  robots: { index: false, follow: false },
};

export default function ClassicHomePage() {
  return <HomeClient />;
}
