import { afterEach, expect, it } from 'vitest'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PRODUCT_UI_HOSTNAME, productUiUrl, resolveProductDataDirectory, resolveProductUiDirectory } from '../src/product-ui.ts'

const roots: string[] = []
afterEach(async () => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

it('serves an explicit development override when it contains an entry document', async () => {
  const root = await mkdtemp(join(tmpdir(), 'desktop-product-ui-'))
  roots.push(root)
  await writeFile(join(root, 'index.html'), '<html lang="zh-CN"></html>')
  expect(resolveProductUiDirectory({ DSH_DESKTOP_PRODUCT_UI: root }, false, 'unused')).toBe(root)
})

it('ignores directories without an index.html entry document', async () => {
  const root = await mkdtemp(join(tmpdir(), 'desktop-product-ui-'))
  roots.push(root)
  expect(resolveProductUiDirectory({ DSH_DESKTOP_PRODUCT_UI: root }, false, 'unused')).toBeUndefined()
})

it('requires an explicit override in development and defaults packaged builds to product resources', async () => {
  const root = await mkdtemp(join(tmpdir(), 'desktop-product-ui-'))
  roots.push(root)
  await mkdir(join(root, 'toneclaw', 'ui'), { recursive: true })
  await writeFile(join(root, 'toneclaw', 'ui', 'index.html'), '<html lang="zh-CN"></html>')
  expect(resolveProductUiDirectory({}, false, root)).toBeUndefined()
  expect(resolveProductUiDirectory({}, true, root)).toBe(join(root, 'toneclaw', 'ui'))
})

it('exposes the product UI hostname on the Desktop scheme', () => {
  expect(productUiUrl()).toBe(`dsh-app://${PRODUCT_UI_HOSTNAME}/`)
})

it('resolves the product data directory from an override or packaged resources', async () => {
  const root = await mkdtemp(join(tmpdir(), 'desktop-product-data-'))
  roots.push(root)
  await mkdir(join(root, 'data'), { recursive: true })
  await mkdir(join(root, 'toneclaw', 'data'), { recursive: true })
  expect(resolveProductDataDirectory({ DSH_DESKTOP_PRODUCT_DATA: join(root, 'data') }, false, root)).toBe(join(root, 'data'))
  expect(resolveProductDataDirectory({}, false, root)).toBeUndefined()
  expect(resolveProductDataDirectory({ DSH_DESKTOP_PRODUCT_DATA: join(root, 'missing') }, true, root)).toBeUndefined()
  expect(resolveProductDataDirectory({}, true, root)).toBe(join(root, 'toneclaw', 'data'))
})
