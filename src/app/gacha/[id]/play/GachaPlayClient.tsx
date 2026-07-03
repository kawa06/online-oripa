"use client";

import { useParams, useSearchParams } from "next/navigation";
import { GachaRevealExperience } from "@/components/gacha/effects/GachaRevealExperience";

export default function GachaPlayClient() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const countParam = searchParams.get("count");
  const count = countParam === "10" ? 10 : 1;

  return <GachaRevealExperience gachaId={id} count={count} />;
}
