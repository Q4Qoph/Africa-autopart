import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from '../../src/frontend/node_modules/typescript/lib/typescript.js'
const source = readFileSync(new URL('../../src/frontend/src/lib/catalogSearch.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } })
const { readSearch, writeSearch, prepareSearch, buildSearchQuery, identifyInput, searchCatalog } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
const empty = () => readSearch(new URLSearchParams())
const vin = 'MHFKB8FS8L0087472'
const categories = [{ make: 'TOYOTA', model: 'FORTUNER' }, { make: 'HYUNDAI', model: 'CRETA' }]

test('number alone preserves leading zeros, suffixes and punctuation', () => {
  for (const q of ['091110K190', '0001234', '09111-0K190', '893410K011B0']) {
    assert.equal(buildSearchQuery(prepareSearch(q, 'number', empty(), categories)).partNumber, q)
  }
})
test('auto names, numbers and VINs are separate intentions', () => {
  assert.equal(identifyInput('oil filter', 'auto'), 'name')
  assert.equal(identifyInput('091110K190', 'auto'), 'number')
  assert.equal(identifyInput(vin, 'auto'), 'vin')
  assert.equal(identifyInput(vin, 'number'), 'number')
})
test('part name alone has no incidental vehicle constraints', () => {
  const query = buildSearchQuery(prepareSearch('oil filter', 'auto', empty(), categories))
  assert.equal(query.keyword, 'oil filter')
  assert.equal(query.make, undefined)
  assert.equal(query.vin, undefined)
})
test('known make prefix becomes an explicit make constraint', () => {
  const state = prepareSearch('Toyota 091110K190', 'auto', empty(), categories)
  assert.equal(state.make, 'TOYOTA')
  assert.equal(buildSearchQuery(state).partNumber, '091110K190')
})
test('known model alone opens its catalog', () => {
  const state = prepareSearch('CRETA', 'auto', empty(), categories)
  assert.equal(state.model, 'CRETA')
  assert.equal(state.make, 'HYUNDAI')
  assert.equal(state.q, '')
})
test('part query retains selected vehicle, engine and compatibility year', () => {
  const state = { ...empty(), q: 'JACK', make: 'TOYOTA', model: 'FORTUNER', scope: 'catalog', year: '2018', steering: 'LHD', engineFamily: '2GD-FTV' }
  const query = buildSearchQuery(state)
  assert.equal(query.year, 2018)
  assert.equal(query.modelYear, undefined)
  assert.equal(query.engineFamily, '2GD-FTV')
  assert.equal(query.keyword, 'JACK')
})
test('catalog context retains customer VIN without constraining reference records', () => {
  const state = { ...empty(), vin, scope: 'catalog', make: 'TOYOTA', model: 'FORTUNER' }
  const next = prepareSearch('JACK', 'auto', state, categories)
  assert.equal(next.vin, vin)
  assert.equal(next.scope, 'catalog')
  assert.equal(buildSearchQuery(next).vin, undefined)
})
test('VIN scope is retained through filtering, sort and pagination', () => {
  const state = readSearch(new URLSearchParams({ vin, filter: 'JACK', page: '2', groupName: 'Electrical Group', sort: 'desc' }))
  const query = buildSearchQuery(state)
  assert.equal(query.vin, vin)
  assert.equal(query.keyword, 'JACK')
  assert.equal(query.page, 2)
  assert.equal(query.groupName, 'Electrical Group')
  assert.equal(query.sortDescending, true)
  assert.deepEqual(readSearch(new URLSearchParams(writeSearch(state))), state)
})
test('URL round trip retains catalog scope and all selected criteria', () => {
  const state = { ...empty(), q: '091110K190', mode: 'number', vin, scope: 'catalog', make: 'TOYOTA', model: 'FORTUNER', year: '2018', steering: 'LHD', engineFamily: '2GD-FTV', vehicleSeries: 'GUN155L', transmission: 'AUTO', marketSpec: 'GCC', page: 3 }
  assert.deepEqual(readSearch(new URLSearchParams(writeSearch(state))), state)
})
test('legacy model routes and part-number URLs remain supported', () => {
  assert.equal(readSearch(new URLSearchParams(), { make: 'TOYOTA', model: 'FORTUNER' }).scope, 'catalog')
  assert.equal(buildSearchQuery(readSearch(new URLSearchParams('partNumber=091110K190'))).partNumber, '091110K190')
})
test('empty, invalid VIN and invalid year cannot issue an unrestricted request', async () => {
  for (const state of [empty(), { ...empty(), scope: 'vin', vin: 'BAD' }, { ...empty(), make: 'TOYOTA', scope: 'catalog', year: 'bad' }]) {
    await assert.rejects(searchCatalog(state, { searchVehicles: async () => assert.fail('Unexpected HTTP request') }))
  }
})
test('empty catalog scope does not become an unrestricted VIN fallback', () => {
  assert.throws(() => buildSearchQuery({ ...empty(), vin, scope: 'catalog' }), /chooseVehicle/)
})
test('PNC search is explicit and preserves its identifier', () => {
  assert.equal(buildSearchQuery(prepareSearch('09110', 'pnc', empty(), categories)).pnc, '09110')
})
test('service failures propagate instead of becoming empty successful results', async () => {
  await assert.rejects(searchCatalog({ ...empty(), q: 'JACK' }, { searchVehicles: async () => { throw new Error('offline') } }), /offline/)
})
test('exact VIN response rejects another vehicle but catalog scope accepts references', async () => {
  const response = { items: [{ vin: 'OTHER' }], totalCount: 1 }
  await assert.rejects(searchCatalog({ ...empty(), vin, scope: 'vin' }, { searchVehicles: async () => response }), /inconsistentVin/)
  assert.equal((await searchCatalog({ ...empty(), vin, scope: 'catalog', make: 'TOYOTA' }, { searchVehicles: async () => response })).totalCount, 1)
})

test('new part searches retain an active exact VIN until explicitly cleared', () => {
  const state = readSearch(new URLSearchParams({ vin }))
  const next = prepareSearch('091110K190', 'number', state, categories)
  assert.equal(next.scope, 'vin')
  assert.equal(buildSearchQuery(next).vin, vin)
  assert.equal(buildSearchQuery(next).partNumber, '091110K190')
})
test('malformed pagination is bounded to a valid first page', () => {
  for (const page of ['Infinity', 'NaN', '-10', '0']) assert.equal(readSearch(new URLSearchParams({ page })).page, 1)
})

test('make alone opens a make-scoped catalog without a keyword', () => {
  const state = prepareSearch('Toyota', 'auto', empty(), categories)
  assert.equal(state.make, 'TOYOTA')
  assert.equal(state.q, '')
  assert.equal(buildSearchQuery(state).keyword, undefined)
})

test('keyword casing uses each make and global pagination crosses make boundaries', async () => {
  const calls = []
  const result = await searchCatalog({ ...empty(), q: 'jack', mode: 'name', page: 2 }, {
    searchVehicles: async params => {
      calls.push(params)
      const total = params.make === 'HYUNDAI' ? 2 : 60
      const start = (params.page - 1) * params.pageSize
      const items = Array.from({ length: Math.min(params.pageSize, Math.max(0, total - start)) }, (_, i) => ({ id: (params.make === 'HYUNDAI' ? 0 : 2) + start + i }))
      return { items, totalCount: total }
    },
  })
  assert.equal(result.totalCount, 62)
  assert.equal(result.items.length, 14)
  assert.deepEqual(result.items.map(p => p.id), Array.from({ length: 14 }, (_, i) => i + 48))
  assert.ok(calls.some(p => p.make === 'HYUNDAI' && p.keyword === 'Jack'))
  assert.ok(calls.some(p => p.make === 'TOYOTA' && p.keyword === 'JACK'))
  assert.ok(calls.every(p => p.pageSize <= 48))
})
test('lowercase part identifiers are searched using catalog casing', () => {
  assert.equal(buildSearchQuery({ ...empty(), q: '091110k190', mode: 'number' }).partNumber, '091110K190')
})

test('customer VIN alone cannot authorize an unrestricted global query', async () => {
  await assert.rejects(searchCatalog({ ...empty(), vin, scope: 'global' }, { searchVehicles: async () => assert.fail('Unrestricted query') }), /chooseVehicle/)
})
test('explicit result-filter input alone remains a bounded keyword search', () => {
  assert.equal(buildSearchQuery({ ...empty(), filter: 'JACK' }).keyword, 'JACK')
})

test('Shop explicitly opts into paginated full-catalog browsing', async () => {
  const calls = []
  await searchCatalog({ ...empty(), page: 2 }, {
    browseAll: true,
    searchVehicles: async params => { calls.push(params); return { items: [], totalCount: 38757 } },
  })
  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [{ page: 2, pageSize: 48 }])
})
test('full-catalog browsing cannot bypass VIN or incomplete catalog guards', () => {
  assert.throws(() => buildSearchQuery({ ...empty(), vin: 'BAD', scope: 'vin' }, true), /invalidVin/)
  assert.throws(() => buildSearchQuery({ ...empty(), vin, scope: 'catalog' }, true), /chooseVehicle/)
  assert.throws(() => buildSearchQuery({ ...empty(), vin, scope: 'global' }, true), /chooseVehicle/)
})
