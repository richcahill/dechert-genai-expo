/* eslint-disable @next/next/no-img-element */

import NavBar from "@/components/nav-bar";
import SideBar from "@/components/sidebar";

export default function WebcamPage() {
  return (
    <main className="w-screen h-screen flex flex-col">
      <NavBar />
      <div className="flex-1 grid grid-cols-4 p-4 gap-2">
        <div className="h-full bg-zinc-50 col-span-3 rounded-md border"></div>
        <SideBar
          name="AI Expo"
          description="AI Expo"
          number={1}
          questions={[
            "What is AI?",
            "How does AI work?",
            "What are the applications of AI?",
          ]}
        />
      </div>
    </main>
  );
}
