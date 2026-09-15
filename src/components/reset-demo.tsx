"use client";
import { useState } from "react";
import { useMock } from "./provider";
import { Modal } from "./ui";
export function ResetDemo() {
  const { reset } = useMock(),
    [open, setOpen] = useState(false);
  return (
    <>
      <button className="button button-outline" onClick={() => setOpen(true)}>
        Reset demo data
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="A fresh start?">
        <p className="small-text muted">
          Restore the sample profiles, appointments, reviews, and schedules.
          This removes only your changes in this local preview.
        </p>
        <div className="modal-actions">
          <button
            className="button button-outline"
            onClick={() => setOpen(false)}
          >
            Keep my changes
          </button>
          <button
            className="button button-dark"
            onClick={() => {
              reset();
              setOpen(false);
            }}
          >
            Restore sample data
          </button>
        </div>
      </Modal>
    </>
  );
}
