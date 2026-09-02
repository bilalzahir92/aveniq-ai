"use client";

import { useState } from "react";

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [sources, setSources] = useState(true);

  return (
    <section className="flex-1 overflow-y-auto bg-[#F8FAFC]">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#64748B]">
            Workspace
          </p>

          <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">
            Settings
          </h1>

          <p className="mt-1 text-sm text-[#64748B]">
            Manage your AVENIQ AI workspace preferences.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
            <div className="border-b border-[#E2E8F0] px-6 py-5">
              <h2 className="text-sm font-semibold text-[#0F172A]">
                Workspace
              </h2>

              <p className="mt-1 text-sm text-[#64748B]">
                Basic workspace information.
              </p>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <label className="text-sm font-medium text-[#334155]">
                  Workspace Name
                </label>

                <input
                  type="text"
                  defaultValue="AVENIQ AI"
                  className="mt-2 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-sm text-[#111827] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-[#2563EB]/10"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#334155]">
                  Industry
                </label>

                <input
                  type="text"
                  defaultValue="Real Estate"
                  className="mt-2 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-sm text-[#111827] outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-[#2563EB]/10"
                />
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
            <div className="border-b border-[#E2E8F0] px-6 py-5">
              <h2 className="text-sm font-semibold text-[#0F172A]">
                AI Preferences
              </h2>

              <p className="mt-1 text-sm text-[#64748B]">
                Control how AVENIQ AI responds to your questions.
              </p>
            </div>

            <div className="divide-y divide-[#F1F5F9]">
              <div className="flex items-center justify-between gap-6 px-6 py-5">
                <div>
                  <p className="text-sm font-medium text-[#1E293B]">
                    Show document sources
                  </p>

                  <p className="mt-1 text-xs text-[#64748B]">
                    Display relevant documents with AI responses.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSources(!sources)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    sources ? "bg-[#2563EB]" : "bg-[#CBD5E1]"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                      sources ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between gap-6 px-6 py-5">
                <div>
                  <p className="text-sm font-medium text-[#1E293B]">
                    Notifications
                  </p>

                  <p className="mt-1 text-xs text-[#64748B]">
                    Receive updates about document processing.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setNotifications(!notifications)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    notifications ? "bg-[#2563EB]" : "bg-[#CBD5E1]"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                      notifications ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
            <div className="border-b border-[#E2E8F0] px-6 py-5">
              <h2 className="text-sm font-semibold text-[#0F172A]">
                Account
              </h2>

              <p className="mt-1 text-sm text-[#64748B]">
                Your account information.
              </p>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EFF6FF] text-sm font-semibold text-[#2563EB] ring-1 ring-[#DBEAFE]">
                  U
                </div>

                <div>
                  <p className="text-sm font-medium text-[#0F172A]">
                    User
                  </p>

                  <p className="mt-1 text-xs text-[#64748B]">
                    Real Estate Team
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8]"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}