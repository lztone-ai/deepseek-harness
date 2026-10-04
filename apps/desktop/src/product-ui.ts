/** Product-owned UI documents surfaced by the Desktop application window. */
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { SCHEME } from './ipc.ts'

/** Scheme hostname that serves the product UI document root. */
export const PRODUCT_UI_HOSTNAME = 'product-ui'

/**
 * Resolve the product UI document root. Packaged builds read the signed product
 * resource layer (`Resources/toneclaw/ui`); development builds opt in with an
 * explicit directory override. Both require an index.html entry document.
 * @param env - Launching process environment.
 * @param isPackaged - Whether the Desktop application runs from an installed bundle.
 * @param resourcesPath - Electron resources directory of packaged builds.
 * @returns Document root containing index.html, or undefined when no product UI applies.
 */
export function resolveProductUiDirectory(
  env: NodeJS.ProcessEnv,
  isPackaged: boolean,
  resourcesPath: string,
): string | undefined {
  const candidate = env.DSH_DESKTOP_PRODUCT_UI ?? (isPackaged ? join(resourcesPath, 'toneclaw', 'ui') : undefined)
  if (candidate === undefined || !existsSync(join(candidate, 'index.html'))) return undefined
  return candidate
}

/**
 * Entry URL of the product UI documents.
 * @returns Product UI home URL served by the Desktop protocol handler.
 */
export function productUiUrl(): string {
  return `${SCHEME}://${PRODUCT_UI_HOSTNAME}/`
}
