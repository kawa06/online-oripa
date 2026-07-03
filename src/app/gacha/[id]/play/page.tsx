import { Suspense } from "react";
import GachaPlayClient from "./GachaPlayClient";

export default function GachaPlayPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center px-4 text-muted">
          読み込み中...
        </div>
      }
    >
      <GachaPlayClient />
    </Suspense>
  );
}
