/* eslint-disable @next/next/no-img-element */
"use client";

import * as fal from "@fal-ai/serverless-client";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

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
    const pixelatedCanvas = pixelatedPreviewRef.current;
    const video = videoRef.current;
    if (canvas === null || video === null || pixelatedCanvas === null) {
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
    pixelatedCanvas.width = width;
    pixelatedCanvas.height = height;

    const context = canvas.getContext("2d");
    const pixelatedContext = pixelatedCanvas.getContext("2d");
    if (context === null || pixelatedContext === null) {
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

    // Sharper pixelation logic
    const pixelSize = 16; // Size of the 'pixel' effect, adjust as needed
    for (let y = 0; y < height; y += pixelSize) {
      for (let x = 0; x < width; x += pixelSize) {
        // Sample a small portion of the original image
        const pixelData = context.getImageData(x, y, 1, 1).data;
        // Draw a larger rectangle with this color
        pixelatedContext.fillStyle = `rgba(${pixelData[0]}, ${pixelData[1]}, ${
          pixelData[2]
        }, ${pixelData[3] / 255})`;
        pixelatedContext.fillRect(x, y, pixelSize, pixelSize);
      }
    }

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
      throttleInterval: 0,
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
    <main className="flex flex-col items-center justify-center px-32 mx-auto my-20">
      <video ref={videoRef} style={{ display: "none" }}></video>
      <div className="flex flex-row justify-center items-start gap-4">
        <canvas
          ref={previewRef}
          width="512"
          height="512"
          style={{ display: "none" }} // Hide this canvas
        ></canvas>
        <canvas
          ref={pixelatedPreviewRef}
          width="512"
          height="512"
          className="rounded"
        ></canvas>
        <img
          ref={processedImageRef}
          src={EMPTY_IMG}
          width={512}
          height={512}
          className="min-w-[512px]  min-h-[512px] aspect-square rounded"
          alt="generated"
        />
      </div>
      <div className="py-12 flex flex-col gap-8 w-[1040px] items-stretch justify-center">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="text-center"
          autoFocus
          placeholder="Enter prompt"
        />
        <Slider
          defaultValue={[33]}
          min={0.44}
          max={1}
          step={0.025}
          value={[strength]}
          onValueChange={(e) => {
            setStrength(e[0]);
          }}
        />
        <Button
          onClick={() => {
            setEnabled(!enabled);
          }}
        >
          {enabled ? "Stop" : "Start"}
        </Button>
      </div>
    </main>
  );
}
