import { assertNever, type Status } from "@/lib/status";

type StatusIconProps = {
  status: Status;
};

// One shape per status (circle, triangle, octagon), so the status can be
// told apart without seeing color. The icon is decorative (aria-hidden)
// because the status word always stands next to it.
export default function StatusIcon({ status }: StatusIconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      className="size-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {shape(status)}
    </svg>
  );
}

function shape(status: Status) {
  switch (status) {
    case "ok":
      // Circle with a check mark
      return (
        <>
          <circle cx="10" cy="10" r="8" />
          <path d="M6.5 10.5 9 13l4.5-5.5" />
        </>
      );
    case "warn":
      // Triangle with an exclamation mark
      return (
        <>
          <path d="M10 2.5 18.5 17h-17Z" />
          <path d="M10 8v4M10 14.5v.01" />
        </>
      );
    case "crit":
      // Octagon (stop sign) with a cross
      return (
        <>
          <path d="M6.5 2h7L18 6.5v7L13.5 18h-7L2 13.5v-7Z" />
          <path d="m7 7 6 6M13 7l-6 6" />
        </>
      );
    default:
      return assertNever(status);
  }
}
