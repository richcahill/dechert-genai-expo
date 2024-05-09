/* eslint-disable @next/next/no-img-element */
"use client";

import * as fal from "@fal-ai/serverless-client";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import NavBar from "@/components/nav-bar";
import SideBar from "@/components/sidebar";
import Icon from "@/components/icon";

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
      <NavBar />
      <div className="flex-1 grid grid-cols-4 p-4 gap-2">
        <div className=" flex flex-col bg-zinc-50 col-span-3 rounded-md border relative overflow-hidden">
          <video ref={videoRef} style={{ display: "none" }}></video>
          <div className="top-4 left-4 absolute w-48 border border-white rounded-md flex items-center overflow-hidden">
            <canvas
              ref={previewRef}
              width="512"
              height="512"
              className="w-full"
            ></canvas>
          </div>
          <div className="w-full flex-1 flex items-center aspect-video overflow-hidden">
            <img
              ref={processedImageRef}
              src={EMPTY_IMG}
              width={512}
              height={512}
              className="w-full"
              alt="generated"
            />
          </div>
          <div className="controls h-32 flex p-4 gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <div>Who would you like to appear as?</div>
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
                setEnabled(!enabled);
              }}
            >
              {enabled ? <Icon name={"pause"} /> : <Icon name={"play"} />}
            </Button>
          </div>
        </div>
        <SideBar
          name="Real Time Deepfake"
          description="Though not absolutely perfect, we're seeing more and more instances of AI-generated deepfake videos that are indistinguishable from the real person. This is a real-time simulation doing the best it can to create a deepfake stream of the person you choose."
          number={1}
          questions={[
            "When the technology to deepfake videos becomes more accessible, how will it change the way we consume and trust media?",
          ]}
          tip="Use the name of someone famous (that's probably included in training data) and move closer to the camera to get better results."
        />
      </div>
    </main>
  );
}
