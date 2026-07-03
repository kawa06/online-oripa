import { Suspense } from "react";
import ShippingForm from "./ShippingForm";

export default function ShippingPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="card-surface p-8 text-center text-muted">読み込み中...</div>
        </div>
      }
    >
      <ShippingForm />
    </Suspense>
  );
}
