"use client";
import { useI18n } from "@/i18n/provider";
import { useState } from "react";
import { useMock } from "./provider";
import { Modal } from "./ui";
export function ResetDemo() {
  const { t } = useI18n();
  const { reset } = useMock(),
    [open, setOpen] = useState(false);
  return (
    <>
      <button className="button button-outline" onClick={() => setOpen(true)}>
        {t("reset.button")}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t("reset.title")}
      >
        <p className="small-text muted">{t("reset.text")}</p>
        <div className="modal-actions">
          <button
            className="button button-outline"
            onClick={() => setOpen(false)}
          >
            {t("reset.keep")}
          </button>
          <button
            className="button button-dark"
            onClick={() => {
              reset();
              setOpen(false);
            }}
          >
            {t("reset.confirm")}
          </button>
        </div>
      </Modal>
    </>
  );
}
