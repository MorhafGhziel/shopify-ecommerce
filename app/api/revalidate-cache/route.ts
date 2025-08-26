import { TAGS } from "@/lib/constants";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function GET() {
  // Revalidate both products and collections
  revalidateTag(TAGS.products);
  revalidateTag(TAGS.collections);

  return NextResponse.json({
    revalidated: true,
    now: Date.now(),
    message: "Cache revalidated successfully",
  });
}
