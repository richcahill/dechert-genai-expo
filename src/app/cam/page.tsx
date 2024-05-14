/* eslint-disable @next/next/no-img-element */
"use client";

import * as fal from "@fal-ai/serverless-client";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import NavBar from "@/components/nav-bar";
import SideBar from "@/components/sidebar";
import Icon from "@/components/icon";
import { Loader } from "lucide-react";

fal.config({
  proxyUrl: "/api/fal/proxy",
});

const EMPTY_IMG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdjOHPmzH8ACDADZKt3GNsAAAAASUVORK5CYII=";

type WebcamOptions = {
  videoRef: MutableRefObject<HTMLVideoElement | null>;
  previewRef: MutableRefObject<HTMLCanvasElement | null>;
  pixelatedPreviewRef: MutableRefObject<HTMLCanvasElement | null>;
  onFrameUpdate?: (data: Uint8Array) => void;
  width?: number;
  height?: number;
};
const useWebcam = ({
  videoRef,
  previewRef,
  pixelatedPreviewRef,
  onFrameUpdate,
  width = 512,
  height = 512,
}: WebcamOptions) => {
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        if (videoRef.current !== null) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      });
    }
  }, [videoRef]);

  const captureFrame = () => {
    const canvas = previewRef.current;
    const video = videoRef.current;
    if (canvas === null || video === null) {
      return;
    }

    const aspectRatio = video.videoWidth / video.videoHeight;
    let sourceX, sourceY, sourceWidth, sourceHeight;

    if (aspectRatio > 1) {
      sourceWidth = video.videoHeight;
      sourceHeight = video.videoHeight;
      sourceX = (video.videoWidth - video.videoHeight) / 2;
      sourceY = 0;
    } else {
      sourceWidth = video.videoWidth;
      sourceHeight = video.videoWidth;
      sourceX = 0;
      sourceY = (video.videoHeight - video.videoWidth) / 2;
    }

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (context === null) {
      return;
    }

    context.drawImage(
      video,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      width,
      height
    );

    if (onFrameUpdate) {
      canvas.toBlob(
        (blob) => {
          blob?.arrayBuffer().then((buffer) => {
            const frameData = new Uint8Array(buffer);
            onFrameUpdate(frameData);
          });
        },
        "image/jpeg",
        0.7
      );
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      captureFrame();
    }, 16);
    return () => clearInterval(interval);
  });
};

type LCMInput = {
  prompt: string;
  image: Uint8Array;
  strength?: number;
  negative_prompt?: string;
  seed?: number | null;
  guidance_scale?: number;
  num_inference_steps?: number;
  enable_safety_checks?: boolean;
  request_id?: string;
  height?: number;
  width?: number;
};

type LCMOutput = {
  image: Uint8Array;
  timings: Record<string, number>;
  seed: number;
  num_inference_steps: number;
  request_id: string;
  nsfw_content_detected: boolean[];
};

const samples = ["leonardo di caprio", "blake lively", "beyonce"];

export default function WebcamPage() {
  const [enabled, setEnabled] = useState(false);
  const processedImageRef = useRef<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previewRef = useRef<HTMLCanvasElement | null>(null);
  const pixelatedPreviewRef = useRef<HTMLCanvasElement | null>(null); // New ref for pixelated canvas
  const [prompt, setPrompt] = useState<string>("leonardo di caprio");
  const [strength, setStrength] = useState<number>(0.44);

  const { send } = fal.realtime.connect<LCMInput, LCMOutput>(
    "fal-ai/sd-turbo-real-time-high-fps-msgpack-a10g",
    {
      connectionKey: "camera-turbo-demo",
      throttleInterval: 500,
      onResult(result) {
        if (processedImageRef.current && result.image) {
          const blob = new Blob([result.image], { type: "image/jpeg" });
          const url = URL.createObjectURL(blob);
          processedImageRef.current.src = url;
        }
      },
    }
  );

  useEffect(() => {
    console.log(strength);
  }, [strength]);

  const onFrameUpdate = (data: Uint8Array) => {
    if (!enabled) {
      return;
    }
    send({
      prompt: prompt + ", 8k, uhd",
      image: data,
      num_inference_steps: 3,
      strength: strength,
      guidance_scale: 1,
      seed: 6252023,
    });
  };

  useWebcam({
    videoRef,
    previewRef,
    pixelatedPreviewRef,
    onFrameUpdate,
    width: 512,
    height: 512,
  });

  return (
    <main className="w-screen h-screen flex flex-col">
      <NavBar number={1} />
      <div className="flex-1 grid grid-cols-4 p-4 gap-2">
        <SideBar
          name="Want to look like your favourite celebrity in real time?"
          title="Real Time Deepfake"
          description={[
            "Type in the name of someone famous and you will see your face transformed to look like them.",
            "This is a real-time simulation doing the best it can to create a deepfake stream of the person you choose.",
            "The power of this model is in “repainting” the entire frame fast, which leads to a slightly blurry, painterly look.",
          ]}
          number={1}
          thought="When the technology to deepfake videos becomes more accessible to a wider audience, how will it change the way we consume and trust media?"
          tip="Use the name of someone famous (that's probably included in training data) and move closer to the camera to get better results."
        />
        <div className="flex flex-col bg-zinc-50 dark:bg-zinc-900 dark:text-white col-span-3 rounded-md border relative overflow-hidden">
          <video ref={videoRef} style={{ display: "none" }}></video>
          <div className="w-full flex-1 flex items-center aspect-video overflow-hidden relative">
            <img
              ref={processedImageRef}
              src={EMPTY_IMG}
              width={512}
              height={512}
              className="w-full"
              alt="generated"
            />
          </div>
          <div className="top-4 left-4 absolute w-48 border border-white rounded-md flex items-center overflow-hidden z-50">
            <canvas
              ref={previewRef}
              width="512"
              height="512"
              className="w-full"
            ></canvas>
          </div>

          <div className="controls flex p-4 gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex justify-start gap-8 items-baseline">
                <div className="text-lg text-zinc-700">
                  Who would you like to appear as?
                </div>
                <div className="flex justify-end gap-2">
                  {samples.map((sample, i) => (
                    <div
                      className="rounded-full px-3 py-0.5 border border-zinc-400 cursor-pointer italic hover:bg-zinc-100 bg-white transition-all text-zinc-400"
                      key={i}
                      onClick={() => setPrompt(sample)}
                    >
                      {sample}
                    </div>
                  ))}
                </div>
              </div>
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="text-4xl bg-transparent border-b-2 p-2 pl-1 border-zinc-400 w-full"
                autoFocus
                placeholder="Enter a name"
              />
            </div>
            <Button
              className="h-full aspect-square"
              onClick={() => {
                setEnabled(!enabled);
              }}
            >
              {enabled ? <Icon name={"pause"} /> : <Icon name={"play"} />}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
