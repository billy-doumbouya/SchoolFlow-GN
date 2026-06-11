import crypto from "crypto";

const DJOMY_API_BASE_URL =
  process.env.DJOMY_API_BASE_URL ||
  (process.env.DJOMY_SANDBOX === "true"
    ? "https://sandbox.djomy.com"
    : "https://api.djomy.com");

const DJOMY_CLIENT_ID = process.env.DJOMY_CLIENT_ID;
const DJOMY_CLIENT_SECRET = process.env.DJOMY_CLIENT_SECRET;

function getAuthHeaders(method, path, body) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${DJOMY_CLIENT_SECRET}`,
    "x-djomy-client-id": DJOMY_CLIENT_ID || "",
    "x-djomy-timestamp": new Date().toISOString(),
  };

  if (DJOMY_CLIENT_SECRET && DJOMY_CLIENT_ID) {
    const signature = crypto
      .createHmac("sha256", DJOMY_CLIENT_SECRET)
      .update(
        `${method.toUpperCase()}\n${path}\n${headers["x-djomy-timestamp"]}\n${body ?? ""}`,
      )
      .digest("hex");
    headers["x-djomy-signature"] = `v1:${signature}`;
  }

  return headers;
}

export async function djomyRequest(method, path, body) {
  if (!DJOMY_CLIENT_ID || !DJOMY_CLIENT_SECRET) {
    throw new Error("Djomy credentials are not configured.");
  }

  const url = `${DJOMY_API_BASE_URL}${path}`;
  const payload = body ? JSON.stringify(body) : undefined;

  const response = await fetch(url, {
    method,
    headers: getAuthHeaders(method, path, payload),
    body: payload,
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const error = new Error(
      `Djomy request failed: ${response.status} ${response.statusText}`,
    );
    error.response = data;
    throw error;
  }

  return data;
}

export function verifyWebhookSignature(rawBody, signatureHeader) {
  if (!DJOMY_CLIENT_SECRET || !signatureHeader) {
    throw new Error("Djomy webhook secret or signature is missing.");
  }

  const [version, signature] = signatureHeader.split(":");
  if (version !== "v1" || !signature) {
    throw new Error("Invalid Djomy webhook signature format.");
  }

  const expected = crypto
    .createHmac("sha256", DJOMY_CLIENT_SECRET)
    .update(rawBody)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");

  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    throw new Error("Invalid Djomy webhook signature.");
  }
}
