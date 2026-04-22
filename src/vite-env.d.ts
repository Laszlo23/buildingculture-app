/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Injected in vite.config from ALCHEMY_API_KEY or VITE_ALCHEMY_API_KEY */
  readonly VITE_ALCHEMY_API_KEY?: string;
  /** Web3.bio `X-API-KEY: Bearer …` (also set from WEB3_BIO_API_KEY / WEB3BIO_API_KEY via vite.config define) */
  readonly VITE_WEB3BIO_API_KEY?: string;
  /** Web3.bio `Authorization: Bearer` (also set from WEB3_BIO_BEARER_TOKEN / BEARER_TOKEN via vite.config define) */
  readonly VITE_WEB3BIO_BEARER_TOKEN?: string;
  readonly VITE_SITE_ORIGIN?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_CHAIN_ID?: string;
  readonly VITE_VAULT_CONTRACT?: string;
  readonly VITE_TREASURY_CONTRACT?: string;
  readonly VITE_DAO_CONTRACT?: string;
  readonly VITE_STRATEGY_REGISTRY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
