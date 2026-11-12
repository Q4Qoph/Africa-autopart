import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from '../../src/frontend/node_modules/typescript/lib/typescript.js'

// Use the project's TypeScript compiler so these tests also run on CI's Node 20.
const source = readFileSync(new URL('../../src/frontend/src/lib/resolveVin.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
})
const { resolveVin } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)

const kia = 'KNAJE55136K135961'
const toyota = 'MHFKB8FS8L0087472'
const empty = { items: [], page: 1, pageSize: 48, totalCount: 0, totalPages: 0 }
const decoded = { decoded: { make: 'Kia', modelYear: 2006, checkDigitValid: false, errors: ['Check digit warning'], nhtsa: { model: 'Sportage' } } }

test('unsupported Kia retains decoded identity and never searches outside the VIN', async () => {
  const calls = []
  const result = await resolveVin(kia.toLowerCase(), {
    getVehicleByVin: async () => decoded,
    searchVehicles: async params => { calls.push(params); return empty },
  })
  assert.equal(result.meta.make, 'Kia')
  assert.equal(result.meta.model, 'Sportage')
  assert.equal(result.meta.modelYear, '2006')
  assert.equal(result.matched, false)
  assert.ok(result.warnings.length)
  assert.deepEqual(calls, [{ vin: kia, page: 1, pageSize: 48 }])
})

test('supported VIN uses only exact catalog rows', async () => {
  const result = await resolveVin(toyota, {
    getVehicleByVin: async () => ({}),
    searchVehicles: async () => ({ ...empty, items: [{ vin: toyota, make: 'TOYOTA', model: 'FORTUNER' }], totalCount: 4489 }),
  })
  assert.equal(result.matched, true)
  assert.equal(result.meta.model, 'FORTUNER')
  assert.equal(result.catalog.totalCount, 4489)
})

test('decoder outage leaves no invented identity or global fallback', async () => {
  const result = await resolveVin(kia, {
    getVehicleByVin: async () => { throw new Error('404') },
    searchVehicles: async () => empty,
  })
  assert.equal(result.meta.make, null)
  assert.equal(result.matched, false)
  assert.ok(result.warnings.includes('Vehicle decoding is unavailable.'))
})

test('catalog outage is an error rather than an empty successful lookup', async () => {
  await assert.rejects(resolveVin(kia, {
    getVehicleByVin: async () => decoded,
    searchVehicles: async () => { throw new Error('offline') },
  }), /Catalog lookup failed/)
})

test('unrelated catalog rows are rejected', async () => {
  await assert.rejects(resolveVin(kia, {
    getVehicleByVin: async () => decoded,
    searchVehicles: async () => ({ ...empty, items: [{ vin: toyota }], totalCount: 38757 }),
  }), /inconsistent VIN/)
})

test('invalid VIN is rejected before any request', async () => {
  await assert.rejects(resolveVin('INVALID', {
    getVehicleByVin: async () => assert.fail('Unexpected request'),
    searchVehicles: async () => assert.fail('Unexpected request'),
  }), /17-character VIN/)
})

test('unknown valid-format VIN has no invented vehicle identity', async () => {
  const result = await resolveVin('ZZZ12345678901234', {
    getVehicleByVin: async () => ({ decoded: { isValidFormat: true } }),
    searchVehicles: async () => empty,
  })
  assert.equal(result.meta.make, null)
  assert.equal(result.meta.model, null)
  assert.equal(result.matched, false)
})

test('exact catalog identity takes precedence over a conflicting generic decode', async () => {
  const result = await resolveVin(kia, {
    getVehicleByVin: async () => decoded,
    searchVehicles: async () => ({ ...empty, items: [{ vin: kia, make: 'TOYOTA', model: 'FORTUNER' }], totalCount: 1 }),
  })
  assert.equal(result.meta.make, 'TOYOTA')
  assert.equal(result.meta.model, 'FORTUNER')
})

test('ambiguous decoded years stay unknown without supporting year evidence', async () => {
  const result = await resolveVin(kia, {
    getVehicleByVin: async () => ({ decoded: { modelYear: 1990, alternateModelYear: 2020 } }),
    searchVehicles: async () => empty,
  })
  assert.equal(result.meta.modelYear, null)
})
