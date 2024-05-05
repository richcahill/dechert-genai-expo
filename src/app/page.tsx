/* eslint-disable @next/next/no-img-element */

import Icon from "@/components/icon";
import Link from "next/link";
import dynamicIconImports from "lucide-react/dynamicIconImports";

const apps = [
  {
    name: "Real Time Deepfake",
    description: "Generate and play.",
    number: 1,
    route: "/cam",
    icon: "camera",
  },
  {
    name: "Fast Video Generation",
    description: "Generate and play.",
    number: 2,
    route: "/vid",
    icon: "video",
  },
  {
    name: "Illustration Generation",
    description: "Generate and play.",
    number: 3,
    route: "/sketch",
    icon: "pencil",
  },
];

export default function WebcamPage() {
  return (
    <main className="w-screen h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col md:flex-row gap-4 ">
        {apps.map((app, i) => (
          <Link key={i} href={app.route}>
            <div
              key={i}
              className="flex flex-col gap-2 items-start justify-end w-96 p-6 border bg-white hover:bg-zinc-50 rounded-md aspect-video hover:-translate-y-2 transition-all relative cursor-pointer overflow-hidden"
            >
              <Icon
                name={app.icon as keyof typeof dynamicIconImports}
                className="w-44 h-44 opacity-5 absolute -top-5 -left-4"
                strokeWidth={1}
              />
              <div className="flex flex-col gap-2">
                <p className="text-xl opacity-25">#{app.number}</p>
                <h2 className="text-2xl font-medium">{app.name}</h2>
              </div>
            </div>
          </Link>
        ))}
        <div></div>
      </div>
    </main>
  );
}
