/**
 * Behaviour shared by the article's hover popovers (`HoverNote`, `Term`).
 *
 * Markup contract — one root holding a trigger and its note:
 *
 *   <span data-hover-popover>
 *     <… data-hover-trigger aria-describedby="id">…</…>
 *     <span class="hover-pop" id="id" role="tooltip" popover="manual">…</span>
 *   </span>
 *
 * The note renders in the top layer (Popover API) so that no `overflow`
 * container — `.article-content` clips horizontally — can cut it off. That
 * means hover, focus and placement are all handled here rather than in CSS.
 * This module is evaluated once per page, so "one note open at a time" holds
 * across every component that uses it.
 */

const ROOT = "[data-hover-popover]";
const EDGE = 12;
const GAP = 6;
const OPEN_DELAY = 60;
const CLOSE_DELAY = 150;

let openRoot: HTMLElement | null = null;
let timer: number | undefined;

const popOf = (root: HTMLElement) => root.querySelector<HTMLElement>(".hover-pop");
const triggerOf = (root: HTMLElement) => root.querySelector<HTMLElement>("[data-hover-trigger]");

function place(root: HTMLElement) {
  const pop = popOf(root);
  const trigger = triggerOf(root);
  if (!pop || !trigger) return;
  // A trigger that wraps onto two lines has a line box per line; anchor to the
  // first line above it, or the last line below it, never the bounding box.
  const lines = trigger.getClientRects();
  const first = lines[0] ?? trigger.getBoundingClientRect();
  const last = lines[lines.length - 1] ?? first;
  const { width, height } = pop.getBoundingClientRect();
  const below = first.top - GAP - height < EDGE;
  const anchor = below ? last : first;
  const center = anchor.left + anchor.width / 2;
  const left = Math.min(Math.max(center - width / 2, EDGE), window.innerWidth - EDGE - width);
  root.dataset.side = below ? "bottom" : "top";
  pop.style.left = `${left}px`;
  pop.style.top = `${below ? anchor.bottom + GAP : anchor.top - GAP - height}px`;
  pop.style.setProperty("--hover-pop-arrow", `${center - left}px`);
}

function open(root: HTMLElement) {
  clearTimeout(timer);
  if (openRoot === root) return;
  if (openRoot) close(openRoot);
  popOf(root)?.showPopover();
  root.dataset.open = "true";
  openRoot = root;
  place(root);
}

function close(root: HTMLElement) {
  if (popOf(root)?.matches(":popover-open")) popOf(root)?.hidePopover();
  delete root.dataset.open;
  if (openRoot === root) openRoot = null;
}

function later(action: () => void, delay: number) {
  clearTimeout(timer);
  timer = window.setTimeout(action, delay);
}

function toggle(root: HTMLElement) {
  if (openRoot === root) close(root);
  else open(root);
}

/** Wires every popover root on the page that is not wired yet. */
export function wireHoverPopovers() {
  for (const root of document.querySelectorAll<HTMLElement>(ROOT)) {
    if (root.dataset.hoverPopoverReady === "true") continue;
    root.dataset.hoverPopoverReady = "true";

    // The popover stays a DOM child of `root`, so moving from the trigger into
    // the note does not count as leaving.
    root.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") later(() => open(root), OPEN_DELAY);
    });
    root.addEventListener("pointerleave", (event) => {
      if (event.pointerType === "mouse") later(() => close(root), CLOSE_DELAY);
    });
    root.addEventListener("focusin", (event) => {
      if ((event.target as HTMLElement).matches(":focus-visible")) open(root);
    });
    root.addEventListener("focusout", (event) => {
      if (!root.contains(event.relatedTarget as Node)) close(root);
    });

    const trigger = triggerOf(root);
    if (!trigger) continue;
    trigger.addEventListener("click", (event) => {
      // A link trigger follows its href on click, except the first tap on a
      // touch screen, which opens the note so it can be read at all.
      const touch = matchMedia("(hover: none)").matches;
      if (trigger instanceof HTMLAnchorElement && (!touch || openRoot === root)) return;
      event.preventDefault();
      if (touch) toggle(root);
      else open(root);
    });
    // A `<span role="button">` trigger (one that can wrap across lines) does
    // not get a button's keyboard activation for free.
    if (trigger.getAttribute("role") === "button") {
      trigger.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        toggle(root);
      });
    }
  }
}

document.addEventListener("pointerdown", (event) => {
  if (openRoot && !openRoot.contains(event.target as Node)) close(openRoot);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && openRoot) close(openRoot);
});
for (const type of ["scroll", "resize"]) {
  window.addEventListener(type, () => openRoot && place(openRoot), { capture: true, passive: true });
}
