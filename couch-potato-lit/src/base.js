import { LitElement } from "lit";

// Render into the element itself instead of a shadow root, so the global
// app.css (copied unchanged from the React version) styles every component.
export class LightElement extends LitElement {
  createRenderRoot() {
    return this;
  }
}
