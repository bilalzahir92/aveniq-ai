"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "aveniq-settings";

const DEFAULT_SETTINGS = {
  workspaceName: "AVENIQ AI",
  industry: "Real Estate",
  sources: true,
  notifications: true,
};

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={enabled}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-all duration-200 ${
        enabled
          ? "bg-[#2563EB] shadow-[0_0_0_4px_rgba(37,99,235,0.08)]"
          : "bg-[#CBD5E1]"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-[0_1px_3px_rgba(15,23,42,0.18)] transition-all duration-200 ${
          enabled ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

function SettingCard({ title, description, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03)] transition-all duration-200 hover:border-[#D7DEE8] hover:shadow-[0_8px_30px_rgba(15,23,42,0.045)]">
      <div className="border-b border-[#E2E8F0] px-5 py-5 sm:px-6">
        <h2 className="text-sm font-semibold tracking-[-0.01em] text-[#0F172A]">
          {title}
        </h2>

        <p className="mt-1.5 max-w-xl text-xs leading-5 text-[#64748B]">
          {description}
        </p>
      </div>

      {children}
    </section>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs font-medium text-[#334155]">
        {label}
      </label>

      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#0F172A] outline-none transition-all duration-200 placeholder:text-[#94A3B8] hover:border-[#CBD5E1] focus:border-[#93C5FD] focus:bg-white focus:ring-4 focus:ring-[#2563EB]/5"
      />
    </div>
  );
}

export default function Settings() {
  const [workspaceName, setWorkspaceName] = useState(
    DEFAULT_SETTINGS.workspaceName
  );
  const [industry, setIndustry] = useState(
    DEFAULT_SETTINGS.industry
  );
  const [notifications, setNotifications] = useState(
    DEFAULT_SETTINGS.notifications
  );
  const [sources, setSources] = useState(
    DEFAULT_SETTINGS.sources
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;

    Promise.resolve()
      .then(() => {
        return localStorage.getItem(
          STORAGE_KEY
        );
      })
      .then((stored) => {
        if (!active || !stored) {
          return;
        }

        try {
          const parsed =
            JSON.parse(stored);

          setWorkspaceName(
            parsed?.workspaceName ??
              DEFAULT_SETTINGS.workspaceName
          );
          setIndustry(
            parsed?.industry ??
              DEFAULT_SETTINGS.industry
          );
          setNotifications(
            parsed?.notifications ??
              DEFAULT_SETTINGS.notifications
          );
          setSources(
            parsed?.sources ??
              DEFAULT_SETTINGS.sources
          );
        } catch (error) {
          console.error(
            "SETTINGS LOAD ERROR:",
            error
          );
        }
      })
      .catch((error) => {
        console.error(
          "SETTINGS LOAD ERROR:",
          error
        );
      });

    return () => {
      active = false;
    };
  }, []);

  function handleSave() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          workspaceName,
          industry,
          notifications,
          sources,
        })
      );
    } catch (error) {
      console.error(
        "SETTINGS SAVE ERROR:",
        error
      );
    }

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2000);
  }

  return (
    <section className="flex-1 overflow-y-auto bg-[#F8FAFC]">
      <div className="mx-auto w-full max-w-4xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        <header className="border-b border-[#E2E8F0] pb-7">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />

            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2563EB]">
              Workspace
            </p>
          </div>

          <h1 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-[#0F172A] sm:text-3xl">
            Settings
          </h1>

          <p className="mt-2 max-w-lg text-xs leading-5 text-[#64748B]">
            Manage your AVENIQ AI workspace preferences and assistant
            behavior.
          </p>
        </header>

        <div className="mt-7 space-y-5">
          <SettingCard
            title="Workspace"
            description="Basic information about your AVENIQ workspace."
          >
            <div className="space-y-5 p-5 sm:p-6">
              <Field
                label="Workspace Name"
                value={workspaceName}
                onChange={setWorkspaceName}
              />

              <Field
                label="Industry"
                value={industry}
                onChange={setIndustry}
              />
            </div>
          </SettingCard>

          <SettingCard
            title="AI Preferences"
            description="Control how AVENIQ AI uses knowledge and communicates with you."
          >
            <div className="divide-y divide-[#E2E8F0]">
              <div className="flex items-center justify-between gap-6 px-5 py-5 transition-colors duration-200 hover:bg-[#FAFBFC] sm:px-6">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-[#0F172A]">
                    Show document sources
                  </p>

                  <p className="mt-1 max-w-md text-xs leading-5 text-[#64748B]">
                    Display relevant documents alongside AI responses.
                  </p>
                </div>

                <Toggle
                  enabled={sources}
                  onChange={() => setSources(!sources)}
                />
              </div>

              <div className="flex items-center justify-between gap-6 px-5 py-5 transition-colors duration-200 hover:bg-[#FAFBFC] sm:px-6">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-[#0F172A]">
                    Notifications
                  </p>

                  <p className="mt-1 max-w-md text-xs leading-5 text-[#64748B]">
                    Receive updates about document processing.
                  </p>
                </div>

                <Toggle
                  enabled={notifications}
                  onChange={() =>
                    setNotifications(!notifications)
                  }
                />
              </div>
            </div>
          </SettingCard>

          <SettingCard
            title="Account"
            description="Your current AVENIQ workspace account."
          >
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 transition-all duration-200 hover:border-[#D7DEE8] hover:bg-white">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#DBEAFE] bg-[#EFF6FF] text-xs font-semibold text-[#2563EB]">
                    U
                  </div>

                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[#0F172A]">
                      User
                    </p>

                    <p className="mt-1 text-[11px] text-[#64748B]">
                      Real Estate Team
                    </p>
                  </div>
                </div>

                <span className="hidden shrink-0 rounded-full border border-[#E2E8F0] bg-white px-2.5 py-1 text-[10px] font-medium text-[#64748B] sm:inline-flex">
                  Workspace Member
                </span>
              </div>
            </div>
          </SettingCard>

          <div className="flex items-center border-t border-[#E2E8F0] pt-5">
            <p className="hidden text-[11px] text-[#94A3B8] sm:block">
              Changes will apply to this workspace.
            </p>

            <button
              type="button"
              onClick={handleSave}
              className="group ml-auto flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_2px_5px_rgba(37,99,235,0.15)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1D4ED8] hover:shadow-[0_8px_24px_rgba(37,99,235,0.16)] active:translate-y-0"
            >
              {saved ? "Saved" : "Save Changes"}

              <svg
                viewBox="0 0 20 20"
                fill="none"
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
              >
                <path
                  d="M4 10h11M11 5l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}