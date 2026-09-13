import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function svgProps({ size = 16, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 20 20',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
    ...rest,
  };
}

/** Module glyphs. Each is a signal repeating what the accent already says. */
export const TimerIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <circle cx="10" cy="11" r="7" />
    <path d="M10 11V7.6M8 2.5h4" />
  </svg>
);

export const MeetingIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <rect x="2.5" y="5.5" width="10" height="9" rx="2.4" />
    <path d="M12.5 9.2l4.2-2.4v6.4l-4.2-2.4z" />
  </svg>
);

export const BoltIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <path d="M10.6 2.6L5.4 10.9h3.6l-.6 6.5 5.2-8.3h-3.6z" fill="currentColor" stroke="none" />
  </svg>
);

export const DownloadIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <path d="M10 3.2v8.4M6.4 8.4L10 12l3.6-3.6M4 15.6h12" />
  </svg>
);

export const ShelfIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <path d="M3 11.5V5.4A1.9 1.9 0 0 1 4.9 3.5h4l1.6 2h4.6A1.9 1.9 0 0 1 17 7.4v4.1M3 11.5h3.2l1.1 1.8h5.4l1.1-1.8H17v2.6A1.9 1.9 0 0 1 15.1 16H4.9A1.9 1.9 0 0 1 3 14.1z" />
  </svg>
);

export const SearchIcon = (p: IconProps) => (
  <svg {...svgProps({ viewBox: '0 0 18 18', ...p })}>
    <circle cx="7.8" cy="7.8" r="5" />
    <path d="M11.6 11.6L15.4 15.4" />
  </svg>
);

export const PinIcon = (p: IconProps) => (
  <svg {...svgProps({ viewBox: '0 0 16 16', ...p })}>
    <path d="M8 10.2V14M4.8 2.2h6.4l-.9 4.1 1.6 1.5v1.1H3.1V7.8l1.6-1.5z" />
  </svg>
);

export const CloseIcon = (p: IconProps) => (
  <svg {...svgProps({ viewBox: '0 0 16 16', strokeWidth: 1.6, ...p })}>
    <path d="M4 4l8 8M12 4l-8 8" />
  </svg>
);

export const PlayIcon = (p: IconProps) => (
  <svg {...svgProps({ viewBox: '0 0 18 18', fill: 'currentColor', stroke: 'none', ...p })}>
    <path d="M5.6 3.4l8.4 5.6-8.4 5.6z" />
  </svg>
);

export const PauseIcon = (p: IconProps) => (
  <svg {...svgProps({ viewBox: '0 0 18 18', fill: 'currentColor', stroke: 'none', ...p })}>
    <rect x="4.4" y="3.4" width="3.3" height="11.2" rx="1.1" />
    <rect x="10.3" y="3.4" width="3.3" height="11.2" rx="1.1" />
  </svg>
);

export const PrevIcon = (p: IconProps) => (
  <svg {...svgProps({ viewBox: '0 0 18 18', fill: 'currentColor', stroke: 'none', ...p })}>
    <path d="M4.4 3.6h1.7v10.8H4.4zM14.4 4.2v9.6L7.2 9z" />
  </svg>
);

export const NextIcon = (p: IconProps) => (
  <svg {...svgProps({ viewBox: '0 0 18 18', fill: 'currentColor', stroke: 'none', ...p })}>
    <path d="M11.9 3.6h1.7v10.8h-1.7zM3.6 4.2v9.6L10.8 9z" />
  </svg>
);

export const ShuffleIcon = (p: IconProps) => (
  <svg {...svgProps({ viewBox: '0 0 18 18', ...p })}>
    <path d="M2.5 4.5h3l7 9h3M13.5 2.6l2 1.9-2 1.9M2.5 13.5h3l2-2.6M11 6.6l1.5-2h3M13.5 11.6l2 1.9-2 1.9" />
  </svg>
);

export const OutputIcon = (p: IconProps) => (
  <svg {...svgProps({ viewBox: '0 0 18 18', ...p })}>
    <path d="M3 7.2v3.6M6.2 5v8M9 2.6v12.8M11.8 5v8M15 7.2v3.6" />
  </svg>
);

export const MicIcon = (p: IconProps) => (
  <svg {...svgProps({ viewBox: '0 0 18 18', ...p })}>
    <rect x="6.6" y="2" width="4.8" height="8.4" rx="2.4" />
    <path d="M4 8.6a5 5 0 0 0 10 0M9 13.6V16" />
  </svg>
);

export const CamIcon = (p: IconProps) => (
  <svg {...svgProps({ viewBox: '0 0 18 18', ...p })}>
    <rect x="2" y="4.6" width="9.4" height="8.8" rx="2.2" />
    <path d="M11.4 8.1l4.6-2.6v7l-4.6-2.6z" />
  </svg>
);

export const WarningIcon = (p: IconProps) => (
  <svg {...svgProps({ viewBox: '0 0 16 16', ...p })}>
    <path d="M8 2.4l6 11H2z" />
    <path d="M8 6.6v3M8 11.4h.01" />
  </svg>
);

export const ResetIcon = (p: IconProps) => (
  <svg {...svgProps({ viewBox: '0 0 16 16', ...p })}>
    <path d="M13 8a5 5 0 1 1-1.7-3.8M13 2.6v2.9h-2.9" />
  </svg>
);

export const RevealIcon = (p: IconProps) => (
  <svg {...svgProps({ viewBox: '0 0 16 16', ...p })}>
    <path d="M2.4 5.2A1.6 1.6 0 0 1 4 3.6h3l1.2 1.6H12a1.6 1.6 0 0 1 1.6 1.6v4.4A1.6 1.6 0 0 1 12 12.8H4a1.6 1.6 0 0 1-1.6-1.6z" />
  </svg>
);

export const ShareIcon = (p: IconProps) => (
  <svg {...svgProps({ viewBox: '0 0 16 16', ...p })}>
    <path d="M8 10.4V2.6M5.4 5.2L8 2.6l2.6 2.6M3.4 9.4v3a1.4 1.4 0 0 0 1.4 1.4h6.4a1.4 1.4 0 0 0 1.4-1.4v-3" />
  </svg>
);

export const CopyIcon = (p: IconProps) => (
  <svg {...svgProps({ viewBox: '0 0 16 16', ...p })}>
    <rect x="5.4" y="5.4" width="7.2" height="7.2" rx="1.6" />
    <path d="M10.6 5.4V4.2a1.6 1.6 0 0 0-1.6-1.6H4.8a1.6 1.6 0 0 0-1.6 1.6v4.2a1.6 1.6 0 0 0 1.6 1.6h1.2" />
  </svg>
);

export const UploadIcon = (p: IconProps) => (
  <svg {...svgProps({ viewBox: '0 0 18 18', ...p })}>
    <path d="M9 12.4V3.4M5.6 6.8L9 3.4l3.4 3.4M3 12.4v1.4a1.6 1.6 0 0 0 1.6 1.6h8.8a1.6 1.6 0 0 0 1.6-1.6v-1.4" />
  </svg>
);

export const CheckIcon = (p: IconProps) => (
  <svg {...svgProps({ viewBox: '0 0 16 16', strokeWidth: 2.2, ...p })}>
    <path d="M3.4 8.4l3 3 6.2-7" />
  </svg>
);

export const ChevronUpIcon = (p: IconProps) => (
  <svg {...svgProps({ viewBox: '0 0 16 16', strokeWidth: 1.7, ...p })}>
    <path d="M4 10l4-4 4 4" />
  </svg>
);

export const ChevronDownIcon = (p: IconProps) => (
  <svg {...svgProps({ viewBox: '0 0 16 16', strokeWidth: 1.7, ...p })}>
    <path d="M4 6l4 4 4-4" />
  </svg>
);

export const MusicNoteIcon = (p: IconProps) => (
  <svg {...svgProps({ viewBox: '0 0 24 24', strokeWidth: 1.4, ...p })}>
    <path d="M9 18V6l10-2v12" />
    <circle cx="6.5" cy="18" r="2.5" />
    <circle cx="16.5" cy="16" r="2.5" />
  </svg>
);

export const AppleIcon = (p: IconProps) => (
  <svg {...svgProps({ viewBox: '0 0 16 16', fill: 'currentColor', stroke: 'none', ...p })}>
    <path d="M11.2 8.5c0-1.5 1.2-2.2 1.3-2.3-.7-1-1.8-1.1-2.2-1.1-.9-.1-1.7.5-2.2.5s-1.2-.5-2-.5c-1 0-2 .6-2.5 1.5-1.1 1.9-.3 4.6.8 6.1.5.7 1.1 1.5 1.9 1.5s1.1-.5 2-.5 1.2.5 2 .5 1.4-.8 1.9-1.5c.6-.9.8-1.7.8-1.8-.1 0-1.7-.6-1.8-2.4zM9.6 3.6c.4-.5.7-1.2.6-1.9-.6 0-1.4.4-1.8.9-.4.5-.7 1.2-.6 1.8.7.1 1.4-.3 1.8-.8z" />
  </svg>
);

export const WifiIcon = (p: IconProps) => (
  <svg {...svgProps({ viewBox: '0 0 16 16', strokeWidth: 1.3, ...p })}>
    <path d="M2 6.5a8.5 8.5 0 0 1 12 0M4.4 9a5.4 5.4 0 0 1 7.2 0" />
    <circle cx="8" cy="11.8" r="1" fill="currentColor" stroke="none" />
  </svg>
);

/** Glyph for the surface currently in the compact left shoulder. */
export const SURFACE_GLYPHS = {
  timer: TimerIcon,
  meeting: MeetingIcon,
  battery: BoltIcon,
  download: DownloadIcon,
  shelf: ShelfIcon,
} as const;
