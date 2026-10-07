import { LitElement, html, css } from "lit";
import { createRef, ref } from "lit/directives/ref.js";
import { keyed } from "lit/directives/keyed.js";
import { palette } from "../lib/colors.js";
import "./potion-page.js";
import "./sorting-hat-page.js";
import "./letter-page.js";
import "./card-fan-indicator.js";

// slots: [letter-stub, potion, hat, letter, potion-stub]
const REAL_FIRST_INDEX = 1;
const REAL_LAST_INDEX = 3;
const STUB_START_INDEX = 0;
const STUB_END_INDEX = 4;

// Port of app/pager.tsx. Same trick: two stub slots at the ends, and when scrolling settles
// on one, silently jump to the real page it imitates.
//   Animated.ScrollView + pagingEnabled  ->  overflow-x + CSS scroll-snap
//   onMomentumEnd                        ->  `scrollend` (debounced scroll as fallback)
//   scrollTo(ref, x, 0, false)           ->  scrollTo({ behavior: "instant" })
//   a PageStub component per side        ->  the real page element again, inert
export class FortunePager extends LitElement {
  static properties = {
    focused: { type: Boolean }, // replaces useIsFocused()
    scrollX: { state: true },
    width: { state: true },
    activeRealIndex: { state: true },
    resetKeys: { state: true },
  };

  #scroller = createRef();
  #settleTimer = null;
  #touching = false;
  #drag = null;
  #resizeObserver = null;

  constructor() {
    super();
    this.focused = true;
    this.scrollX = 0;
    this.width = 0;
    this.activeRealIndex = 0;
    // bumped for a page each time you swipe away from it: a new `keyed` value makes Lit
    // throw the old element away and create a fresh one (state starts over)
    this.resetKeys = [0, 0, 0];
  }

  connectedCallback() {
    super.connectedCallback();
    this.#resizeObserver = new ResizeObserver(() => this.#measure());
    this.#resizeObserver.observe(this);
    this._onKey = (e) => {
      if (!this.focused || e.target.tagName === "INPUT") return;
      if (e.key === "ArrowRight") this.#page(1);
      if (e.key === "ArrowLeft") this.#page(-1);
    };
    addEventListener("keydown", this._onKey);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#resizeObserver?.disconnect();
    removeEventListener("keydown", this._onKey);
    clearTimeout(this.#settleTimer);
  }

  #measure() {
    const el = this.#scroller.value;
    if (!el || !el.clientWidth) return;
    this.width = el.clientWidth;
    this.#jump((this.activeRealIndex + REAL_FIRST_INDEX) * this.width);
  }

  #jump(left) {
    this.#scroller.value?.scrollTo({ left, behavior: "instant" });
    this.scrollX = left;
  }

  // move `offset` pages from the page we're currently on (negative = left)
  #page(offset) {
    const el = this.#scroller.value;
    const w = el.clientWidth;
    el.scrollTo({ left: (Math.round(el.scrollLeft / w) + offset) * w, behavior: "smooth" });
  }

  #onScroll() {
    this.scrollX = this.#scroller.value.scrollLeft;
    // browsers without `scrollend`: consider scrolling finished after a quiet moment
    if (!("onscrollend" in window)) {
      clearTimeout(this.#settleTimer);
      this.#settleTimer = setTimeout(() => !this.#touching && !this.#drag && this.#settle(), 150);
    }
  }

  #settle() {
    const el = this.#scroller.value;
    const w = el.clientWidth;
    const index = Math.round(el.scrollLeft / w);
    if (index === STUB_START_INDEX) {
      this.#jump(REAL_LAST_INDEX * w);
      this.#setActive(REAL_LAST_INDEX);
    } else if (index === STUB_END_INDEX) {
      this.#jump(REAL_FIRST_INDEX * w);
      this.#setActive(REAL_FIRST_INDEX);
    } else {
      this.#setActive(index);
    }
  }

  #setActive(slotIndex) {
    const real = Math.min(Math.max(slotIndex - REAL_FIRST_INDEX, 0), REAL_LAST_INDEX - REAL_FIRST_INDEX);
    if (real === this.activeRealIndex) return;
    this.resetKeys = this.resetKeys.map((key, i) => (i === this.activeRealIndex ? key + 1 : key));
    this.activeRealIndex = real;
  }

  // --- mouse drag, so the pager works with a mouse on desktop (touch/trackpad scroll natively) ---
  #pointerDown(e) {
    if (e.pointerType !== "mouse" || e.button !== 0 || e.target.closest?.("input")) return;
    const el = this.#scroller.value;
    this.#drag = { x: e.clientX, left: el.scrollLeft, moved: false };
    el.style.scrollSnapType = "none";
    el.style.userSelect = el.style.webkitUserSelect = "none"; // no text selection while dragging
  }
  #pointerMove(e) {
    if (!this.#drag) return;
    const dx = e.clientX - this.#drag.x;
    if (Math.abs(dx) > 5) this.#drag.moved = true;
    this.#scroller.value.scrollLeft = this.#drag.left - dx;
  }
  #pointerUp() {
    if (!this.#drag) return;
    const el = this.#scroller.value;
    el.style.scrollSnapType = "";
    el.style.userSelect = el.style.webkitUserSelect = "";
    // snap to the page nearest to where it was released (snap type restored => browser animates)
    el.scrollTo({ left: Math.round(el.scrollLeft / el.clientWidth) * el.clientWidth, behavior: "smooth" });
    // swallow the click that follows a drag so it can't trigger a page's tap handler
    const wasDrag = this.#drag.moved;
    this.#drag = null;
    if (wasDrag) addEventListener("click", (e) => e.stopPropagation(), { capture: true, once: true });
  }

  firstUpdated() {
    this.#measure();
  }

  #slide(content, inert = false) {
    return html`<section class="slide" ?inert=${inert}>${content}</section>`;
  }

  render() {
    const a = this.activeRealIndex;
    const on = (i) => this.focused && a === i;
    return html`
      <div
        class="scroller"
        ${ref(this.#scroller)}
        @scroll=${this.#onScroll}
        @scrollend=${this.#settle}
        @touchstart=${() => (this.#touching = true)}
        @touchend=${() => ((this.#touching = false), "onscrollend" in window || this.#onScroll())}
        @pointerdown=${this.#pointerDown}
        @pointermove=${this.#pointerMove}
        @pointerup=${this.#pointerUp}
        @pointerleave=${this.#pointerUp}
      >
        ${this.#slide(html`<letter-page .active=${false}></letter-page>`, true)}
        ${this.#slide(keyed(this.resetKeys[0], html`<potion-page .active=${on(0)}></potion-page>`))}
        ${this.#slide(keyed(this.resetKeys[1], html`<sorting-hat-page .active=${on(1)}></sorting-hat-page>`))}
        ${this.#slide(keyed(this.resetKeys[2], html`<letter-page .active=${on(2)}></letter-page>`))}
        ${this.#slide(html`<potion-page .active=${false}></potion-page>`, true)}
      </div>
      <card-fan-indicator
        @select-page=${(e) => this.#page(e.detail.offset)}
        .scrollX=${this.scrollX}
        .pageWidth=${this.width || 1}
        .indexOffset=${REAL_FIRST_INDEX}
      ></card-fan-indicator>
      <a class="seal" href="#/history" aria-label="History"><img src="/img/wax-seal.png" alt="" draggable="false" /></a>
    `;
  }

  static styles = [
    palette,
    css`
      :host { display: block; position: relative; height: 100%; overflow: hidden; }
      .scroller {
        display: flex;
        height: 100%;
        overflow-x: auto;
        overflow-y: hidden;
        scroll-snap-type: x mandatory;
        scrollbar-width: none;
        overscroll-behavior-x: contain;
      }
      .scroller::-webkit-scrollbar { display: none; }
      .slide { flex: 0 0 100%; min-width: 0; overflow: hidden; height: 100%; scroll-snap-align: start; scroll-snap-stop: always; }
      .seal { position: absolute; top: 40px; right: 16px; z-index: 10; width: 60px; height: 60px; }
      .seal img { width: 100%; height: 100%; object-fit: contain; display: block; }
    `,
  ];
}
customElements.define("fortune-pager", FortunePager);
