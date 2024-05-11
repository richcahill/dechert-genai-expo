/* eslint-disable @next/next/no-img-element */
"use client";

import * as fal from "@fal-ai/serverless-client";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import NavBar from "@/components/nav-bar";
import SideBar from "@/components/sidebar";
import Icon from "@/components/icon";
import { Camera, Loader, Pencil, Wand } from "lucide-react";

const styles = [
  {
    title: "Pastel Color Illustration",
    prompt:
      "Create an illustration where the style should be minimalistic with a subdued colour palette, clean lines, and a hand-drawn, sketchy feel but with chunky lines. The illustration should have perspective that gives a sense of depth, and the overall tone should be inviting and informative. Use a limited color scheme with soft hues and ensure that the lines are not too sharp. The illustration should be of ",
  },
  {
    title: "Pastel Color Illustration",
    prompt:
      "Create an illustration where the style should be minimalistic with a pastel color palette, clean lines, and a hand-drawn, sketchy feel but with chunky lines. The illustration should have perspective that gives a sense of depth, and the overall tone should be inviting and informative. Use a limited color scheme with soft hues and ensure that the lines are not too sharp. The illustration should be of ",
  },
  {
    title: "Sharpie Sketch",
    prompt:
      "Create an illustration where the style should be simple hand drawn in the style of a minimalist sharpie sketch using and using only black and white. The illustration should be of ",
  },
  {
    title: "Realistic Scene",
    prompt:
      "Create a realistic photo where the style is minimalist and professional. The photo should be of ",
  },
];

const EMPTY_IMG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdjOHPmzH8ACDADZKt3GNsAAAAASUVORK5CYII=";

export default function WebcamPage() {
  const [sketchInProgress, setSketchInProgress] = useState(false);
  const [photoInProgress, setPhotoInProgress] = useState(false);
  const [prompt, setPrompt] = useState<string>(
    "a group of people sitting around a campfire in the woods"
  );
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const getSketch = async () => {
    setSketchInProgress(true);

    let sketchPrompt = styles[0].prompt + prompt;

    const response = await fetch("/api/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: sketchPrompt }),
    });
    const data = await response.json();
    setSketchInProgress(false);
    setImageUrl(data[0].url);
  };

  const getImage = async () => {
    setPhotoInProgress(true);

    let sketchPrompt = styles[3].prompt + prompt;

    const response = await fetch("/api/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: sketchPrompt }),
    });
    const data = await response.json();
    setPhotoInProgress(false);
    setImageUrl(data[0].url);
  };

  return (
    <main className="w-screen h-screen flex flex-col">
      <NavBar number={2} />
      <div className="flex-1 grid grid-cols-4 p-4 gap-2">
        <div className=" flex flex-col bg-zinc-50 col-span-3 rounded-md border relative overflow-hidden">
          <div className="w-full flex-1 flex items-center aspect-video overflow-hidden">
            <img
              src={imageUrl || EMPTY_IMG}
              width={512}
              height={512}
              className="w-full"
              alt="generated"
            />
          </div>
          <div className="controls h-32 flex p-4 gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <div>What would you like to generate a drawing of?</div>
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
                getSketch();
              }}
              disabled={sketchInProgress}
            >
              {sketchInProgress ? (
                <Loader className="animate-spin" />
              ) : (
                <Pencil />
              )}
            </Button>
            <Button
              className="h-full aspect-square"
              onClick={() => {
                getImage();
              }}
              disabled={photoInProgress}
            >
              {photoInProgress ? (
                <Loader className="animate-spin" />
              ) : (
                <Camera />
              )}
            </Button>
          </div>
        </div>
        <SideBar
          name="How would you like to be able to draw with your words?"
          title="No Pen Illustration"
          description={[
            "Type in the details of a drawing you would like the model to create for you in a matter of seconds.",
            "Click the pencil for a sketch or the camera for a realistic photo.",
            "If you are not happy with the results, add or edit instructions and try again.",
            "This model was developed and successfully used by Dechert's Innovation Certificate Program 2024 participants to generate illustrations for their innovation projects.",
          ]}
          number={2}
          thought="How can the untrained eye tell apart visuals created by human illustrators vs visuals generated by AI tools?"
          tip="Be as descriptive as possible to get the best results."
        />
      </div>
    </main>
  );
}
