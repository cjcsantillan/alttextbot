import { InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { bedrockClient, BEDROCK_MODEL_ID } from "./bedrockClient.js";

const SYSTEM_PROMPT = `You are an accessibility assistant that writes image descriptions for
screen reader users. For the image you are given, respond with ONLY a JSON object
matching this shape, no prose before or after it:

{
  "altText": "a concise, literal description under 125 characters, suitable for an alt attribute",
  "caption": "a fuller 1-3 sentence description including relevant detail and context"
}

Do not editorialize or guess at intent. Describe what is visibly in the image.`;

export class BedrockInvocationError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = "BedrockInvocationError";
  }
}

/**
 * Ask the configured Bedrock vision model for alt text + a caption for an image.
 * @param {Buffer} imageBuffer
 * @param {string} mimeType e.g. "image/png"
 * @returns {Promise<{altText: string, caption: string}>}
 */
export async function generateAltText(imageBuffer, mimeType) {
  const body = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType,
              data: imageBuffer.toString("base64"),
            },
          },
          {
            type: "text",
            text: "Describe this image for alt text and a caption, per your instructions.",
          },
        ],
      },
    ],
  };

  const command = new InvokeModelCommand({
    modelId: BEDROCK_MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(body),
  });

  let response;
  try {
    response = await bedrockClient.send(command);
  } catch (err) {
    throw new BedrockInvocationError("Bedrock invocation failed", { cause: err });
  }

  const payload = JSON.parse(Buffer.from(response.body).toString("utf-8"));
  const rawText = payload?.content?.[0]?.text;
  if (!rawText) {
    throw new BedrockInvocationError("Bedrock response had no text content");
  }

  return parseModelJson(rawText);
}

function parseModelJson(rawText) {
  // Models occasionally wrap JSON in a code fence despite instructions — strip it.
  const cleaned = rawText.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new BedrockInvocationError("Could not parse model response as JSON", { cause: err });
  }

  if (typeof parsed.altText !== "string" || typeof parsed.caption !== "string") {
    throw new BedrockInvocationError("Model response was missing altText or caption");
  }

  return { altText: parsed.altText.trim(), caption: parsed.caption.trim() };
}
