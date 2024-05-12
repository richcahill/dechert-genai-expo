/* eslint-disable @next/next/no-img-element */
"use client";

import * as fal from "@fal-ai/serverless-client";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import NavBar from "@/components/nav-bar";
import SideBar from "@/components/sidebar";
import Icon from "@/components/icon";
import { Loader, Wand } from "lucide-react";

fal.config({
  proxyUrl: "/api/fal/proxy",
});

const EMPTY_IMG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdjOHPmzH8ACDADZKt3GNsAAAAASUVORK5CYII=";

export default function WebcamPage() {
  const [inProgress, setInProgress] = useState(false);
  const [prompt, setPrompt] = useState<string>(
    "A boat steaming through a canal in a storm"
  );
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const getImage = async () => {
    setInProgress(true);

    // const image = await fal.subscribe("fal-ai/fast-turbo-diffusion", {
    //   input: {
    //     prompt:
    //       "A cinematic shot of a baby racoon wearing an intricate italian priest robe.",
    //   },
    //   logs: true,
    //   onQueueUpdate: (update) => {
    //     if (update.status === "IN_PROGRESS" && update.logs) {
    //       update.logs.map((log) => log.message).forEach(console.log);
    //     }
    //   },
    // });

    const result = (await fal.subscribe(
      "fal-ai/fast-animatediff/turbo/text-to-video",
      {
        input: {
          prompt: `${prompt}. masterpiece, best quality, minimal, photorealistic. lots of movement`,
          negative_prompt: "low quality, blurry, pixelated, animation, cartoon",
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS" && update.logs) {
            update.logs.map((log) => log.message).forEach(console.log);
          }
        },
      }
    )) as any;
    setInProgress(false);
    // setImageUrl(image.result.url);
    if (result.video.url) {
      setVideoUrl(result.video.url);
    }
    console.log(result);
  };

  return (
    <main className="w-screen h-screen flex flex-col">
      <NavBar number={3} />
      <div className="flex-1 grid grid-cols-4 p-4 gap-2">
        <div className=" flex flex-col bg-zinc-50 col-span-3 rounded-md border relative overflow-hidden">
          <div className="w-full flex-1 flex items-center aspect-video overflow-hidden bg-zinc-500 relative">
            {/* <img
              src={imageUrl || EMPTY_IMG}
              width={512}
              height={512}
              className="w-full"
              alt="generated"
            /> */}
            {videoUrl && (
              <video
                src={videoUrl || ""}
                controls
                className="w-full"
                autoPlay
                loop
              ></video>
            )}
            {inProgress && (
              <div className="absolute inset-0 bg-zinc-800/50 flex items-center justify-center">
                <Loader className="animate-spin text-white" />
              </div>
            )}
          </div>
          <div className="controls h-32 flex p-4 gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <div className="text-lg">
                What would you like to generate an animated gif of?
              </div>
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="text-4xl bg-transparent border-b-2 p-2 pb-3 border-zinc-300 w-full"
                autoFocus
                placeholder="Enter a name"
              />
            </div>
            <Button
              className="h-full aspect-square"
              onClick={() => {
                getImage();
              }}
              disabled={inProgress}
            >
              {inProgress ? <Loader className="animate-spin" /> : <Wand />}
            </Button>
          </div>
        </div>
        <SideBar
          name="Want to create your own GIF?"
          title="Short Animation Generation"
          description={[
            "Describe a scene with movement and let the AI will create a GIF for you in seconds.",
            "Be aware that the result can be somehow abstract (i.e. not exactly what you had in mind) but this is a taste of what's to come.",
            "However, this year we've seen an uptick in what's possible with video. New private models being released this year like OpenAI's Sora and RunwayML's Gen-2 are able to generate high quality video content with minimal human input - stay tuned.",
          ]}
          thought="What will the film and media industry look like in 2030? Can you tell what data this AI was trained with?"
          number={3}
          tip="Use a short and descriptive prompt that describes some kind of movement for best results."
        />
      </div>
    </main>
  );
}
