"use client";

import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

// ===== Button =====
type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "success";
const BTN_VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white hover:bg-brand-dark border-transparent",
  secondary: "bg-white text-gray-700 hover:bg-gray-50 border-gray-300",
  danger: "bg-red-600 text-white hover:bg-red-700 border-transparent",
  success: "bg-green-600 text-white hover:bg-green-700 border-transparent",
  ghost: "bg-transparent text-gray-600 hover:bg-gray-100 border-transparent",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md";
}) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center gap-1 rounded-md border font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-2 text-sm",
        BTN_VARIANT[variant],
        className
      )}
      {...props}
    />
  );
}

// ===== Inputs =====
const fieldClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:bg-gray-100";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(fieldClass, props.className)} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cx(fieldClass, props.className)} />;
}

export function Select({
  options,
  placeholder,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  options?: readonly string[];
  placeholder?: string;
}) {
  return (
    <select {...props} className={cx(fieldClass, "bg-white", props.className)}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options?.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
      {children}
    </select>
  );
}

// ===== Labeled field wrapper =====
export function Labeled({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cx("block", className)}>
      <span className="mb-1 block text-xs font-medium text-gray-600">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  );
}

// ===== Cards / layout =====
export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "rounded-lg border border-gray-200 bg-white shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

type CardTone = "default" | "blue" | "amber" | "green" | "red" | "gray";
const CARD_TONE: Record<CardTone, string> = {
  default: "border-gray-200",
  blue: "border-blue-200 bg-blue-50",
  amber: "border-amber-200 bg-amber-50",
  green: "border-green-200 bg-green-50",
  red: "border-red-200 bg-red-50",
  gray: "border-gray-200 bg-gray-100",
};

export function SummaryCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number | string;
  tone?: CardTone;
}) {
  return (
    <div className={cx("rounded-lg border bg-white p-3.5", CARD_TONE[tone])}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

export function PageTitle({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="mt-0.5 text-sm text-gray-500">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-12 text-center text-sm text-gray-400">{message}</div>
  );
}

// ===== Badge & tone helpers =====
export type BadgeTone = "blue" | "amber" | "green" | "red" | "gray" | "slate";
const BADGE_TONE: Record<BadgeTone, string> = {
  blue: "bg-blue-100 text-blue-700",
  amber: "bg-amber-100 text-amber-800",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  gray: "bg-gray-100 text-gray-600",
  slate: "bg-slate-200 text-slate-700",
};

export function Badge({
  tone = "gray",
  children,
}: {
  tone?: BadgeTone;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium",
        BADGE_TONE[tone]
      )}
    >
      {children}
    </span>
  );
}

export function stageTone(stage: string): BadgeTone {
  if (stage === "구독 계약 완료") return "green";
  if (stage === "보류") return "amber";
  if (stage === "이탈" || stage === "종료") return "gray";
  if (stage === "계약 조건 협의" || stage === "정기관리 플랜 제안") return "blue";
  return "slate";
}

export function statusTone(status: string): BadgeTone {
  switch (status) {
    case "활성":
      return "blue";
    case "보류":
      return "amber";
    case "계약완료":
      return "green";
    case "이탈":
    case "종료":
    case "비활성":
    case "삭제됨":
      return "gray";
    case "아카이브됨":
      return "slate";
    default:
      return "gray";
  }
}

export function needTone(need: string): BadgeTone {
  if (need === "높음") return "red";
  if (need === "중간") return "amber";
  return "gray";
}
