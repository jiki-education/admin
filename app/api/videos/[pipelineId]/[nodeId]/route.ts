/**
 * Video Output API Route
 *
 * Proxies video output requests from pipeline nodes through Rails API to S3
 * Enables streaming of generated videos and asset files in the frontend
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pipelineId: string; nodeId: string }> }
) {
  try {
    const { pipelineId, nodeId } = await params;

    // Get auth token from request headers or query parameter
    const authHeader = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);
    const tokenParam = searchParams.get("token");

    let authToken: string | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      authToken = authHeader;
    } else if (tokenParam) {
      authToken = `Bearer ${tokenParam}`;
    }

    if (!authToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Build Rails API URL for video output (no user_id needed with auth)
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/video_production/pipelines/${pipelineId}/nodes/${nodeId}/output`;

    // Forward request to Rails API with auth headers
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: authToken,
        "Content-Type": "application/json"
      },
      redirect: "follow" // Follow the redirect to S3
    });

    if (!response.ok) {
      // Only log errors that aren't "file not found" - those are expected for pending nodes
      if (response.status !== 404) {
        console.log("API response status:", response.status);
        console.log("API response headers:", Object.fromEntries(response.headers.entries()));
        const errorText = await response.text();
        console.log("API error response:", errorText);
      }

      return NextResponse.json({ error: "Video not found or unavailable" }, { status: response.status });
    }

    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "video/mp4",
        "Content-Length": response.headers.get("Content-Length") || "",
        "Cache-Control": response.headers.get("Cache-Control") || "public, max-age=3600"
      }
    });
  } catch (error) {
    console.error("Video output proxy error:", error);

    return NextResponse.json({ error: "Failed to fetch video output" }, { status: 500 });
  }
}
