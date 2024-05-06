import OpenAI from "openai";
export const maxDuration = 60; // This function can run for a maximum of 5 seconds
// export const runtime = "edge";
// export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
});

export async function POST(request: Request) {
  console.log("hello");
  const data = await request.json();
  console.log(data.prompt);

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: data.prompt,
    n: 1,
    size: "1024x1024",
  });
  let image_url = response.data[0].url;

  console.log(image_url);

  return Response.json(response.data);
}
