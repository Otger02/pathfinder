import { createServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { sessionId, sosEventId, userCode, deviceInfo, gpsLat, gpsLon } =
      (await req.json()) as {
        sessionId: string;
        sosEventId?: string;
        userCode: string;
        deviceInfo?: Record<string, unknown>;
        gpsLat?: number;
        gpsLon?: number;
      };

    if (!sessionId || !userCode) {
      return Response.json({ error: "sessionId and userCode required" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Create recording row
    const { data, error } = await supabase
      .from("sos_recordings")
      .insert({
        session_id: sessionId,
        sos_event_id: sosEventId || null,
        user_code: userCode,
        device_info: deviceInfo || {},
        gps_lat: gpsLat || null,
        gps_lon: gpsLon || null,
        status: "recording",
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);

    // Link recording to SOS event if provided
    if (sosEventId) {
      await supabase
        .from("sos_events")
        .update({ recording_id: data.id })
        .eq("id", sosEventId);
    }

    return Response.json({ recordingId: data.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return Response.json({ error: message }, { status: 500 });
  }
}
