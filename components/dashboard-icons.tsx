import type { PropsWithChildren } from "react";

type IconProps = {
  className?: string;
};

function Icon({ className, children }: PropsWithChildren<IconProps>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function LogoMark({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="currentColor" />
      <path d="M12 7v10M7 12h10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function DashboardIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 5.5h6v6H4zM14 5.5h6v3h-6zM14 10.5h6v8h-6zM4 13.5h6v5H4z" />
    </Icon>
  );
}

export function PatientsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 12a3 3 0 1 0-3-3 3 3 0 0 0 3 3Z" />
      <path d="M5 19a7 7 0 0 1 14 0" />
    </Icon>
  );
}

export function DoctorsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 3v4" />
      <path d="M15 3v4" />
      <path d="M5 8h14" />
      <path d="M8 21h8" />
      <path d="M7 8v5a5 5 0 0 0 10 0V8" />
    </Icon>
  );
}

export function AppointmentsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="5" width="16" height="15" rx="3" />
      <path d="M8 3v4M16 3v4M4 9h16" />
      <path d="M9 13h6M9 16h4" />
    </Icon>
  );
}

export function RecordsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 4h10l3 3v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
      <path d="M9 11h6M9 15h6" />
    </Icon>
  );
}

export function InventoryIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 8.5 12 4l8 4.5-8 4.5-8-4.5Z" />
      <path d="M4 8.5V16l8 4 8-4V8.5" />
      <path d="M12 13v7" />
    </Icon>
  );
}

export function BillingIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 4h10v16H7z" />
      <path d="M9.5 8h5M9.5 11.5h5M9.5 15h3" />
      <path d="M10 4V2M14 4V2" />
    </Icon>
  );
}

export function SuppliersIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 20V9l7-4 7 4v11" />
      <path d="M9 20v-6h6v6" />
    </Icon>
  );
}

export function ReportsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 19h14" />
      <path d="M7 16V9" />
      <path d="M12 16V5" />
      <path d="M17 16v-7" />
    </Icon>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 8.5a3.5 3.5 0 1 0 3.5 3.5A3.5 3.5 0 0 0 12 8.5Z" />
      <path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a7.3 7.3 0 0 0-1.8-1l-.4-2.6H9.7l-.4 2.6a7.3 7.3 0 0 0-1.8 1l-2.4-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a7.3 7.3 0 0 0 1.8 1l.4 2.6h4.6l.4-2.6a7.3 7.3 0 0 0 1.8-1l2.4 1 2-3.4-2-1.5c.1-.3.1-.6.1-1Z" />
    </Icon>
  );
}

export function SupportIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 18h.01" />
      <path d="M9.5 9a2.5 2.5 0 1 1 4.5 1.5c-.8.8-2 1.3-2 2.5v.5" />
      <path d="M12 22a10 10 0 1 0-10-10" />
    </Icon>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </Icon>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M15 17H5.5a1 1 0 0 1-.9-1.4l1.1-2.2V10a6.3 6.3 0 0 1 12.6 0v3.4l1.1 2.2a1 1 0 0 1-.9 1.4H15" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </Icon>
  );
}

export function HelpIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.7 9a2.5 2.5 0 1 1 4.6 1.3c-.7.9-1.8 1.2-2.3 2.2-.2.4-.2.8-.2 1.5" />
      <path d="M12 17h.01" />
    </Icon>
  );
}

export function ClipboardCheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 4h6a2 2 0 0 1 2 2v14H7V6a2 2 0 0 1 2-2Z" />
      <path d="M9 4V3h6v1" />
      <path d="m10 13 1.5 1.5 3-3" />
    </Icon>
  );
}

export function AlertTriangleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 4 3.5 19h17L12 4Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </Icon>
  );
}

export function MoneyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="5" width="17" height="14" rx="4" />
      <path d="M12 8v8" />
      <path d="M15 10.2c0-1.2-1.3-2.2-3-2.2s-3 1-3 2.2 1.3 1.8 3 2.2 3 1 3 2.2-1.3 2.2-3 2.2-3-1-3-2.2" />
    </Icon>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function BriefcaseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 7V6a3 3 0 0 1 6 0v1" />
      <path d="M4 8h16v11H4z" />
      <path d="M4 12h16" />
    </Icon>
  );
}

export function MedicineIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10 14 14 10" />
      <path d="M8.5 8.5a3 3 0 0 1 4.2 0l2.8 2.8a3 3 0 0 1 0 4.2l-2.1 2.1a3 3 0 0 1-4.2 0l-2.8-2.8a3 3 0 0 1 0-4.2Z" />
    </Icon>
  );
}

export function FileIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 4h7l4 4v12H7z" />
      <path d="M14 4v4h4" />
      <path d="M9 12h6M9 16h6" />
    </Icon>
  );
}

export function MoreIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={props.className} aria-hidden="true">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}

export function WarningSmallIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={props.className} aria-hidden="true">
      <path d="M12 4 3 20h18L12 4Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  );
}

export function EditIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 20h4l10-10-4-4L4 16v4Z" />
      <path d="M13 7l4 4" />
    </Icon>
  );
}

export function DeleteIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M6 6l1 14h10l1-14" />
      <path d="M10 11v6M14 11v6" />
    </Icon>
  );
}