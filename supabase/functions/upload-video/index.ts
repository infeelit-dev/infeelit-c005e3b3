import { S3Client, PutObjectCommand } from "npm:@aws-sdk/client-s3@3.731.1";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const R2 = new S3Client({
  region: "auto",
  endpoint: Deno.env.get("R2_ENDPOINT")!,
  credentials: {
    accessKeyId: Deno.env.get("R2_ACCESS_KEY_ID")!,
    secretAccessKey: Deno.env.get("R2_SECRET_ACCESS_KEY")!,
  },
  forcePathStyle: true,
});

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const clientFileName = (formData.get("fileName") as string) || "";

    if (!file) {
      return new Response(JSON.stringify({ error: "Missing file" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Derive a safe extension from an allowlist; never trust the client path.
    const allowedExt = new Map<string, string>([
      ["video/mp4", "mp4"],
      ["video/webm", "webm"],
      ["video/quicktime", "mov"],
      ["audio/mpeg", "mp3"],
      ["audio/mp4", "m4a"],
      ["audio/webm", "webm"],
      ["audio/ogg", "ogg"],
      ["image/jpeg", "jpg"],
      ["image/png", "png"],
    ]);
    const ext =
      allowedExt.get(file.type) ||
      (clientFileName.match(/\.([a-zA-Z0-9]{1,5})$/)?.[1]?.toLowerCase() ?? "");
    if (!ext || !/^[a-z0-9]{1,5}$/.test(ext)) {
      return new Response(JSON.stringify({ error: "Unsupported file type" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Construct the object key entirely server-side, scoped to the user.
    const safeKey = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const buffer = await file.arrayBuffer();

    await R2.send(
      new PutObjectCommand({
        Bucket: "infeelit-memories",
        Key: safeKey,
        Body: new Uint8Array(buffer),
        ContentType: file.type,
      }),
    );

    const url = `${Deno.env.get("R2_ENDPOINT")}/${safeKey}`;

    return new Response(JSON.stringify({ url, key: safeKey }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    console.error("[upload-video]", err);
    return new Response(JSON.stringify({ error: "Upload failed. Please try again." }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
