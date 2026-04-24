/** Base.dev / Base App builder domain verification — keep in sync with `index.html`. */
export const BASE_DEV_APP_ID = "69eaf432e67b282fc52d29ee";

/**
 * Ensures `<meta name="base:app_id" content="…" />` is present (Next.js `<Head>` equivalent for this Vite SPA).
 * Runs synchronously on boot so verifiers that execute minimal JS still see the tag after hydration.
 */
export function ensureBaseAppIdMeta(): void {
  if (typeof document === "undefined") return;

  let el = document.querySelector<HTMLMetaElement>('meta[name="base:app_id"]');
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", "base:app_id");
    const charset = document.head.querySelector("meta[charset]");
    if (charset?.parentNode) {
      charset.insertAdjacentElement("afterend", el);
    } else {
      document.head.prepend(el);
    }
  }
  el.setAttribute("content", BASE_DEV_APP_ID);
}
