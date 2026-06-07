"use client";

import { useState } from "react";
import type { LeadPayload } from "@/lib/types";

type Props = {
  onResult: (runId: string, publicToken: string, leadId: string) => void;
  onError: (message: string) => void;
  disabled: boolean;
};

const INITIAL: LeadPayload = {
  companyName: "",
  industry: "",
  companySize: "",
  contactName: "",
  contactRole: "",
  painPoints: "",
  budgetSignals: "",
  intentSignals: "",
  currentSolution: "",
};

export default function LeadForm({ onResult, onError, disabled }: Props) {
  const [form, setForm] = useState<LeadPayload>(INITIAL);

  function set(key: keyof LeadPayload) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error ?? "Something went wrong");
        return;
      }
      onResult(data.runId, data.publicToken, data.leadId);
    } catch {
      onError("Network error — please try again");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Company */}
      <div className="bg-surface rounded-2xl border border-border p-6">
        <SectionLabel number="01" label="Company" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          <Field
            label="Company Name"
            id="companyName"
            value={form.companyName}
            onChange={set("companyName")}
            placeholder="Acme Inc."
            required
            disabled={disabled}
          />
          <Field
            label="Industry"
            id="industry"
            value={form.industry}
            onChange={set("industry")}
            placeholder="SaaS / Fintech / Healthcare…"
            required
            disabled={disabled}
          />
          <Field
            label="Company Size"
            id="companySize"
            value={form.companySize}
            onChange={set("companySize")}
            placeholder="50–200 employees"
            required
            disabled={disabled}
            className="sm:col-span-2"
          />
        </div>
      </div>

      {/* Contact */}
      <div className="bg-surface rounded-2xl border border-border p-6">
        <SectionLabel number="02" label="Contact" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          <Field
            label="Contact Name"
            id="contactName"
            value={form.contactName}
            onChange={set("contactName")}
            placeholder="Jane Smith"
            required
            disabled={disabled}
          />
          <Field
            label="Contact Role"
            id="contactRole"
            value={form.contactRole}
            onChange={set("contactRole")}
            placeholder="VP of Operations"
            required
            disabled={disabled}
          />
        </div>
      </div>

      {/* Signals */}
      <div className="bg-surface rounded-2xl border border-border p-6">
        <SectionLabel number="03" label="Signals" />
        <div className="space-y-4 mt-5">
          <TextArea
            label="Pain Points"
            id="painPoints"
            value={form.painPoints}
            onChange={set("painPoints")}
            placeholder="What problems are they trying to solve?"
            required
            disabled={disabled}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextArea
              label="Budget Signals"
              id="budgetSignals"
              value={form.budgetSignals}
              onChange={set("budgetSignals")}
              placeholder="Any mentions of budget or spend?"
              disabled={disabled}
            />
            <TextArea
              label="Intent Signals"
              id="intentSignals"
              value={form.intentSignals}
              onChange={set("intentSignals")}
              placeholder="Timeline, urgency, active evaluation?"
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {/* Additional Context */}
      <div className="bg-surface rounded-2xl border border-border p-6">
        <SectionLabel number="04" label="Additional Context" />
        <div className="mt-5">
          <TextArea
            label="Current Solution"
            id="currentSolution"
            value={form.currentSolution ?? ""}
            onChange={set("currentSolution")}
            placeholder="What are they currently using to handle this? (spreadsheets, a competitor, nothing…)"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={disabled}
          className="bg-accent text-primary font-semibold text-sm px-8 py-3 rounded-lg cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/30 active:translate-y-0 active:shadow-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {disabled ? "Analysing…" : "Analyse Lead →"}
        </button>
      </div>
    </form>
  );
}

function SectionLabel({ number, label }: { number: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 bg-surface-secondary border border-border rounded-full px-3 py-1">
      <span className="text-[11px] font-semibold text-muted">{number}</span>
      <span className="text-[11px] font-semibold text-body uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

type FieldProps = {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

function Field({
  label,
  id,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  className,
}: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-xs font-medium text-body mb-1.5">
        {label}
        {required && <span className="text-hot ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors disabled:opacity-50"
      />
    </div>
  );
}

type TextAreaProps = {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
};

function TextArea({
  label,
  id,
  value,
  onChange,
  placeholder,
  required,
  disabled,
}: TextAreaProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-body mb-1.5">
        {label}
        {required && <span className="text-hot ml-0.5">*</span>}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={3}
        className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors disabled:opacity-50 resize-none"
      />
    </div>
  );
}
