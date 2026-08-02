"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

/**
 * The ground every search-field panel sits on. A step below --color-atlas-night
 * (#0A1628) on purpose: these panels open across the seam between the hero
 * photograph and the white catalogue band, and the deeper ink keeps the page
 * from reading through the surface. Fully opaque — no alpha, no blur.
 */
export const POPOVER_GROUND = "#050A14";

type Align = "start" | "center" | "end";
type Scrim = "always" | "mobile" | "never";

interface AnchorBox {
  left: number;
  right: number;
  top: number;
  width: number;
}

interface FieldPopoverProps {
  open: boolean;
  onClose: () => void;
  /** The field the panel hangs off. Clicks inside it belong to the trigger. */
  anchorRef: RefObject<HTMLElement | null>;
  /** Panel width at md and up — any CSS width value. */
  width: string;
  /** Width below md. "anchor" matches the trigger's own width. */
  mobileWidth?: string;
  /** Horizontal placement against the anchor. */
  align?: Align;
  /** Below md, centre the panel in the viewport instead of anchoring it. */
  modalOnMobile?: boolean;
  scrim?: Scrim;
  labelledBy?: string;
  children: ReactNode;
}

const MD = "(min-width: 768px)";
const GUTTER = 12;

/* The panel never renders on the server, but the hook still runs there and
   React warns about it. */
const useOnScreenLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const subscribeMd = (notify: () => void) => {
  const mq = window.matchMedia(MD);
  mq.addEventListener("change", notify);
  return () => mq.removeEventListener("change", notify);
};
const readMd = () => window.matchMedia(MD).matches;
/* Server renders assume small. Nothing is open on first paint, so the panel
   never lays out against this guess. */
const readMdOnServer = () => false;

/**
 * A dropdown that renders on <body> rather than inside the field.
 *
 * The hero's search widget sits several nested stacking contexts deep, so a
 * panel rendered in place is trapped inside them however high its z-index goes
 * — the catalogue heading and the partner marquee below the fold were painting
 * straight over the calendar. Portalling to the document root puts the panel in
 * the page's own top layer, where the z-index means what it says.
 */
export default function FieldPopover({
  open,
  onClose,
  anchorRef,
  width,
  mobileWidth = "min(580px, 92vw)",
  align = "center",
  modalOnMobile = false,
  scrim = "mobile",
  labelledBy,
  children,
}: FieldPopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const desktop = useSyncExternalStore(subscribeMd, readMd, readMdOnServer);
  const [box, setBox] = useState<AnchorBox | null>(null);
  const [shift, setShift] = useState(0);

  /* On <body> there is no positioned ancestor to hang off, so the panel tracks
     the trigger's viewport box and re-measures on anything that can move it.
     Measured before paint so the panel never flashes at its fallback spot. */
  useOnScreenLayoutEffect(() => {
    if (!open) return;
    const measure = () => {
      const r = anchorRef.current?.getBoundingClientRect();
      if (r) setBox({ left: r.left, right: r.right, top: r.bottom + GUTTER, width: r.width });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, anchorRef]);

  /* A wide panel centred under a field near the edge of the window would hang
     off it. Measure once placed and nudge it back inside. */
  useOnScreenLayoutEffect(() => {
    if (!open) {
      setShift(0);
      return;
    }
    const el = panelRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.left < GUTTER) setShift((s) => s + (GUTTER - r.left));
    else if (r.right > window.innerWidth - GUTTER)
      setShift((s) => s + (window.innerWidth - GUTTER - r.right));
  }, [open, desktop, box]);

  if (!open || typeof document === "undefined") return null;

  const anchored = (w: string): CSSProperties => {
    if (!box) return { left: "50%", top: "50%", transform: "translate(-50%, -50%)" };
    const top = box.top;
    const resolved = w === "anchor" ? `${box.width}px` : w;
    const common = { top, width: resolved, maxHeight: `calc(100vh - ${top + GUTTER * 2}px)` };
    if (align === "start") return { ...common, left: box.left + shift };
    if (align === "end") return { ...common, left: box.right + shift, transform: "translateX(-100%)" };
    return { ...common, left: box.left + box.width / 2 + shift, transform: "translateX(-50%)" };
  };

  const placement: CSSProperties =
    desktop || !modalOnMobile
      ? anchored(desktop ? width : mobileWidth)
      : {
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: mobileWidth,
          maxHeight: "90vh",
        };

  const showScrim = scrim === "always" || (scrim === "mobile" && !desktop);

  return createPortal(
    <>
      {/* Not decoration: this is what stops the catalogue band and the partner
          marquee from animating away behind a panel that sits over them. */}
      {showScrim && (
        <div
          className="fixed inset-0 z-[9998] bg-[#050A14]/80 backdrop-blur-[3px]"
          onClick={onClose}
        />
      )}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal={showScrim || undefined}
        aria-labelledby={labelledBy}
        className="fixed z-[9999] flex flex-col overflow-hidden rounded-2xl border border-white/15 shadow-[0_40px_120px_rgba(0,0,0,0.75)]"
        style={{ ...placement, maxWidth: `calc(100vw - ${GUTTER * 2}px)`, backgroundColor: POPOVER_GROUND }}
      >
        {children}
      </div>
    </>,
    document.body
  );
}
