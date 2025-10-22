/**
 * Video Output API Route
 *
 * Proxies video output requests from pipeline nodes through Rails API to S3
 * Enables streaming of generated videos and asset files in the frontend
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { pipelineId: string; nodeId: string } }
) {
  try {
    const { pipelineId, nodeId } = params;
    
    // Build Rails API URL for video output
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/video_production/pipelines/${pipelineId}/nodes/${nodeId}/output?user_id=1`;
    
    // Forward request headers to Rails API
    const headers = new Headers();
    
    // Copy relevant headers from the original request
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers.set("authorization", authHeader);
    }
    
    const contentType = request.headers.get("content-type");
    if (contentType) {
      headers.set("content-type", contentType);
    }
    
    const userAgent = request.headers.get("user-agent");
    if (userAgent) {
      headers.set("user-agent", userAgent);
    }

    // Fetch from Rails API with redirect following enabled
    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
      redirect: "follow" // Follow S3 presigned URL redirects
    });

    // Return proxied response
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
    
  } catch (error) {
    console.error("Video output proxy error:", error);
    
    return NextResponse.json(
      { error: "Failed to fetch video output" },
      { status: 500 }
    );
  }
}