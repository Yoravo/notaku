"use client";

import { useState } from "react";
import { UpgradeModal } from "./upgrade-modal";
import { useTranslations } from "next-intl";

export function UpgradeButton({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  const tDash = useTranslations("dashboard");
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
        {label || tDash("upgradeToPro")}
      </button>
      {showModal && <UpgradeModal onClose={() => setShowModal(false)} />}
    </>
  );
}
