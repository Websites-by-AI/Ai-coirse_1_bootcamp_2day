import { NextResponse } from "next/server";
import { createInternshipApplication } from "@/lib/internship";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const result = await createInternshipApplication({
      fullName: typeof body.fullName === "string" ? body.fullName : "",
      email: typeof body.email === "string" ? body.email : "",
      phone: typeof body.phone === "string" ? body.phone : "",
      track: typeof body.track === "string" ? body.track : "",
      locationId: typeof body.locationId === "string" ? body.locationId : "",
      resumeText: typeof body.resumeText === "string" ? body.resumeText : "",
      portfolioUrl: typeof body.portfolioUrl === "string" ? body.portfolioUrl : "",
      availability: typeof body.availability === "string" ? body.availability : "",
      source: typeof body.source === "string" ? body.source : "",
      utmSource: typeof body.utmSource === "string" ? body.utmSource : "",
      utmMedium: typeof body.utmMedium === "string" ? body.utmMedium : "",
      utmCampaign: typeof body.utmCampaign === "string" ? body.utmCampaign : "",
      referrer: typeof body.referrer === "string" ? body.referrer : request.headers.get("referer") ?? "",
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "ثبت درخواست کارآموزی انجام نشد." }, { status: 400 });
  }
}
