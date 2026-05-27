"use client";

import { useState } from "react";
import { UpgradeModal } from "./upgrade-modal";

export function UpgradeButton({ className }: { className?: string }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={
          className ||
          "rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white cursor-pointer hover:bg-blue-700 transition-colors"
        }
      >
        Upgrade ke Pro
      </button>
      {showModal && <UpgradeModal onClose={() => setShowModal(false)} />}
    </>
  );
}
