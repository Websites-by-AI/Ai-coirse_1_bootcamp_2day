import { NextResponse } from "next/server";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "آموزش هوش مصنوعی فارسی";
  const maxResults = Math.min(50, Math.max(1, Number(searchParams.get("max") || "10")));

  if (!YOUTUBE_API_KEY) {
    return NextResponse.json(
      { error: "YouTube API Key تنظیم نشده است. در Vercel متغیر YOUTUBE_API_KEY را اضافه کنید." },
      { status: 500 }
    );
  }

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", query);
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", String(maxResults));
    url.searchParams.set("relevanceLanguage", "fa");
    url.searchParams.set("key", YOUTUBE_API_KEY);

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error?.message || "خطای YouTube API" },
        { status: res.status }
      );
    }

    const videos = (data.items || []).map((item: any) => ({
      id: item.id?.videoId,
      title: item.snippet?.title,
      description: item.snippet?.description,
      thumbnail: item.snippet?.thumbnails?.medium?.url,
      channelTitle: item.snippet?.channelTitle,
      publishedAt: item.snippet?.publishedAt,
      url: `https://youtube.com/watch?v=${item.id?.videoId}`,
    }));

    return NextResponse.json({ videos, total: videos.length });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}
