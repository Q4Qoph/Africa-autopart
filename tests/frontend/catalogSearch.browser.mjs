// Run against a local Vite app. This performs catalog reads only.
// CHROMIUM_PATH=/path/to/chrome AAP_TEST_URL=http://127.0.0.1:5175 node tests/frontend/catalogSearch.browser.mjs
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import assert from 'node:assert/strict'
const base = process.env.AAP_TEST_URL || 'http://127.0.0.1:5175'
if (!process.env.CHROMIUM_PATH) throw new Error('Set CHROMIUM_PATH to the Chromium executable')
const out = process.env.AAP_TEST_OUTPUT || '/tmp/aap-search-checks'
fs.mkdirSync(out, { recursive: true })
const browser = spawn(process.env.CHROMIUM_PATH, ['--headless', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=0', `--user-data-dir=${out}/profile`, '--window-size=1440,1000', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] })
let ws
const evidence = []
try {
  const debug = await new Promise((resolve, reject) => {
    let log = ''
    const timer = setTimeout(() => reject(new Error(log)), 20000)
    browser.stderr.on('data', b => { log += b; const match = log.match(/DevTools listening on (ws:\/\/\S+)/); if (match) { clearTimeout(timer); resolve(match[1]) } })
    browser.on('exit', () => { clearTimeout(timer); reject(new Error(log)) })
  })
  const target = await (await fetch(`http://${new URL(debug).host}/json/new?about:blank`, { method: 'PUT' })).json()
  ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }))
  let id = 0, network = [], errors = [], responses = [], retried = 0
  const pending = new Map()
  const send = (method, params = {}) => new Promise((resolve, reject) => { const n = ++id; pending.set(n, { resolve, reject }); ws.send(JSON.stringify({ id: n, method, params })) })
  ws.addEventListener('message', event => {
    const m = JSON.parse(event.data)
    if (m.id) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p?.reject(new Error(JSON.stringify(m.error))) : p?.resolve(m.result) }
    else if (m.method === 'Network.requestWillBeSent' && m.params.request.url.includes('workers.dev')) network.push(m.params.request.url)
    else if (m.method === 'Network.responseReceived' && m.params.response.url.includes('workers.dev')) responses.push({ url: m.params.response.url, status: m.params.response.status })
    else if (m.method === 'Network.loadingFailed') responses.push({ failed: m.params.errorText })
    else if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text)
  })
  const evaluate = async expression => { const r = await send('Runtime.evaluate', { expression, returnByValue: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails)); return r.result.value }
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
  const wait = async (expression, timeout = 45000) => {
    const start = Date.now()
    let retriedThisWait = false
    while (Date.now() - start < timeout) {
      if (await evaluate(expression)) return
      if (!retriedThisWait && !expression.includes('lookup could not') && Date.now() - start > 2000 && await evaluate("document.body.innerText.includes('lookup could not be completed')")) {
        retriedThisWait = true; retried++
        await evaluate("Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()==='Retry')?.click()")
      }
      await sleep(200)
    }
    throw new Error(`Timeout: ${expression}\n${await evaluate('document.body.innerText')}`)
  }
  const text = () => evaluate('document.body.innerText')
  const navigate = async path => { network = []; responses = []; errors = []; await send('Page.navigate', { url: base + path }); await wait('!!document.querySelector("[data-testid=catalog-query]")') }
  const field = async (selector, value) => {
    await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)}); if(!el)throw new Error('Missing field');const proto=el.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(el,${JSON.stringify(value)});el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}))})()`)
    await sleep(50)
  }
  const clickText = async label => evaluate(`(()=>{const b=Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()===${JSON.stringify(label)});if(!b)throw new Error('Missing button '+${JSON.stringify(label)});b.click()})()`)
  const cards = () => evaluate('document.querySelectorAll("[data-testid=catalog-part]").length')
  const finish = async name => { await sleep(100); assert.equal(errors.length, 0, errors.join('\n')); evidence.push({ name, url: await evaluate('location.href'), text: await text(), network: [...network], responses: [...responses], retried }); console.log('PASS', name) }
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable')
  await send('Network.setBlockedURLs', { urls: ['*youtube.com*', '*googlevideo.com*'] })
  await navigate('/')
  await evaluate("localStorage.setItem('aa-language','en')")
  await navigate('/shop')
  await wait('document.querySelectorAll("[data-testid=catalog-part]").length===48')
  assert.ok((await text()).includes('38757 catalog records'))
  assert.ok(!network.some(u => u.includes('PartsSeed')))
  assert.ok(network.some(u => { const p = new URL(u).searchParams; return u.includes('/vehicles/search') && p.get('pageSize') === '48' && !p.has('keyword') && !p.has('vin') }))
  await finish('Shop displays the full main catalog with paginated search')
  await clickText('2')
  await wait("new URLSearchParams(location.search).get('page')==='2' && !document.body.innerText.includes('Searching the catalog…')")
  await wait(`performance.getEntriesByType('resource').some(e=>e.name.includes('/api/vehicles/search') && new URL(e.name).searchParams.get('page')==='2')`)
  assert.ok(network.some(u => new URL(u).searchParams.get('page') === '2'))
  await field('[data-testid=catalog-query]', '091110K190'); await clickText('Search')
  await wait('document.querySelectorAll("[data-testid=catalog-part]").length===2')
  await evaluate("document.querySelector('[data-testid=catalog-part]').click()")
  await wait("document.body.innerText.includes('Request price and availability')")
  await wait(`Array.from(document.querySelectorAll('img')).some(img=>img.alt.includes('image unavailable') && img.complete && img.naturalWidth>0)`)
  assert.ok(network.some(u => u.includes('/vehicles/parts/')))
  await finish('Shop pagination, number search, catalog details and SVG placeholder')
  await evaluate("window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))")
  await evaluate("document.querySelector('header a[href=\"/shop\"]').click()")
  await wait("!location.search && document.body.innerText.includes('38757 catalog records')")
  await evaluate("history.pushState({},'', '/parts-search');dispatchEvent(new PopStateEvent('popstate'))")
  await wait("location.pathname==='/parts-search' && document.body.innerText.includes('Start a search or select')")
  assert.equal(await cards(), 0)
  await finish('Shop reset and full-catalog cache isolated from empty search')
  if (!process.env.AAP_SHOP_ONLY) {
  await navigate('/')
  await field('[data-testid=catalog-query]', '091110K190')
  await evaluate("document.querySelector('[data-testid=catalog-query]').closest('form').requestSubmit()")
  await wait('document.querySelectorAll("[data-testid=catalog-part]").length===2')
  assert.ok(network.some(u => u.includes('partNumber=091110K190')))
  await finish('homepage part number without vehicle')

  await navigate('/parts-search?q=JACK&mode=name')
  await wait('document.querySelectorAll("[data-testid=catalog-part]").length>0')
  assert.ok(network.some(u => u.includes('make=TOYOTA')) && network.some(u => u.includes('make=HYUNDAI')))
  await finish('global part-name search')

  await navigate('/parts-search?q=091110K190&mode=number&make=HYUNDAI&scope=catalog')
  await wait("document.body.innerText.includes('No catalog records match')")
  assert.equal(await cards(), 0)
  await clickText('Search all vehicles')
  await wait('document.querySelectorAll("[data-testid=catalog-part]").length===2')
  await evaluate('history.back()')
  await wait("document.body.innerText.includes('No catalog records match')")
  await evaluate('history.forward()')
  await wait('document.querySelectorAll("[data-testid=catalog-part]").length===2')
  await finish('scoped number, explicit global broadening and browser history')

  await navigate('/parts-search?vin=KNAJE55136K135961')
  await wait("document.body.innerText.includes('Kia Sportage 2006')")
  assert.equal(await cards(), 0)
  assert.ok(!(await text()).includes('Check digit'))
  assert.ok(!network.some(u => u.includes('/decode')))
  assert.ok(network.filter(u => u.includes('/vehicles/search')).every(u => new URL(u).searchParams.get('vin') === 'KNAJE55136K135961'))
  await field('select[id$="-make"]', 'TOYOTA')
  await field('select[id$="-model"]', 'FORTUNER')
  await clickText('Browse selected catalog')
  await wait("document.body.innerText.includes('selected make conflicts')")
  await finish('partial Kia decode retained, no unrelated catalog, conflicting make blocked')

  await navigate('/parts-search?vin=KNAJE55136K135961&scope=catalog&make=TOYOTA&model=FORTUNER')
  await wait("document.body.innerText.includes('selected make conflicts')")
  assert.equal(await cards(), 0)
  assert.ok(!network.some(u => new URL(u).searchParams.get('make') === 'TOYOTA'))
  await finish('conflicting customer VIN and catalog in a shared URL are blocked')

  await navigate('/parts-search?vin=MHFKB8FS8L0087473')
  await wait("document.body.innerText.includes('No exact VIN catalog was found')")
  await field('select[id$="-make"]', 'TOYOTA')
  await field('select[id$="-model"]', 'FORTUNER')
  await field('input[id$="-year"]', '2018')
  await field('select[id$="-steering"]', 'LHD')
  await field('select[id$="-config"]', '0')
  await clickText('Browse selected catalog')
  await wait('document.querySelectorAll("[data-testid=catalog-part]").length===48')
  assert.ok((await text()).includes('8978 catalog records'))
  assert.ok(network.some(u => { const p = new URL(u).searchParams; return p.get('year') === '2018' && !p.has('vin') }))
  assert.ok((await text()).includes('MHFKB8FS8L0087473'))
  await field('#part-result-filter', 'JACK'); await clickText('Apply filter')
  await wait('document.querySelectorAll("[data-testid=catalog-part]").length===14')
  assert.ok(network.some(u => { const p = new URL(u).searchParams; return p.get('keyword') === 'JACK' && p.get('year') === '2018' && p.get('steering') === 'LHD' && !p.has('vin') }))
  await field('#part-result-filter', ''); await clickText('Apply filter')
  await wait('document.querySelectorAll("[data-testid=catalog-part]").length===48')
  await clickText('2'); await wait("new URLSearchParams(location.search).get('page')==='2' && !document.body.innerText.includes('Searching the catalog…')")
  await field('#part-sort', 'desc'); await wait("new URLSearchParams(location.search).get('sort')==='desc' && !document.body.innerText.includes('Searching the catalog…')")
  const shot = await send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(out + '/guided-catalog.png', Buffer.from(shot.data, 'base64'))
  await finish('guided reference catalog, retained customer VIN, filters, pagination and sorting')

  await navigate('/brands/TOYOTA/models/LAND%20CRUISER/parts')
  await wait('document.querySelectorAll("[data-testid=catalog-part]").length===48')
  assert.ok((await text()).includes('3744 catalog records'))
  await finish('Land Cruiser 70 separated from Prado')

  await navigate('/parts-search?vin=MHFKB8FS8L0087472')
  await wait("document.body.innerText.includes('4489 catalog records')")
  assert.ok((await text()).includes('2019'))
  await evaluate("document.querySelector('[data-testid=catalog-part]').click()")
  await wait("document.body.innerText.includes('Request price and availability')")
  assert.ok(!(await text()).includes('$45.00'))
  assert.ok(!(await text()).includes('In Stock'))
  await finish('exact VIN retains source identity and quotation detail action')

  await navigate('/parts-search?vin=MHFKB8FS8L0087472')
  await wait("document.body.innerText.includes('4489 catalog records')")
  await field('[data-testid=catalog-query]', '091110K190')
  await clickText('Search')
  await wait('document.querySelectorAll("[data-testid=catalog-part]").length===1')
  assert.ok(network.some(u => { const p = new URL(u).searchParams; return p.get('vin') === 'MHFKB8FS8L0087472' && p.get('partNumber') === '091110K190' }))
  await send('Page.reload'); await wait('document.querySelectorAll("[data-testid=catalog-part]").length===1')
  await finish('part-number submission and refresh retain exact VIN scope')

  await navigate('/parts-search?q=MHFKB8FS8L0087472&mode=number')
  await wait("document.body.innerText.includes('No catalog records match')")
  assert.ok(network.some(u => u.includes('partNumber=MHFKB8FS8L0087472')))
  assert.ok(!network.some(u => u.includes('/vehicles/vin/')))
  await finish('explicit number mode overrides VIN-shaped input')

  await navigate('/parts-search?model=LAND%20CRUISER')
  await wait("document.body.innerText.includes('3744 catalog records')")
  await finish('model-only direct link does not mix Prado')

  await navigate('/parts-search?q=09111-0K190&mode=number')
  await wait("document.body.innerText.includes('No catalog records match')")
  await clickText('Search: 091110K190')
  await wait('document.querySelectorAll("[data-testid=catalog-part]").length===2')
  await finish('explicit formatted-number alternative')

  await navigate('/parts-search?q=09110&mode=pnc')
  await wait('document.querySelectorAll("[data-testid=catalog-part]").length>0')
  assert.ok(network.some(u => u.includes('pnc=09110')))
  await finish('explicit diagram callout search')

  await send('Network.setBlockedURLs', { urls: ['*api/vehicles/vin/*'] })
  await navigate('/parts-search?vin=MHFKB8FS8L0087472')
  await wait("document.body.innerText.includes('4489 catalog records')")
  await finish('decoder unavailable with exact catalog still usable')
  await send('Network.setBlockedURLs', { urls: ['*api/vehicles/search*'] })
  await navigate('/parts-search?q=JACK&mode=name')
  await wait("document.body.innerText.includes('lookup could not be completed')")
  assert.equal(await cards(), 0)
  await finish('catalog failure shown as error, no unrelated fallback')
  await send('Network.setBlockedURLs', { urls: [] })

  await navigate('/parts-search?q=oil%20filter&mode=name')
  await wait('document.querySelectorAll("[data-testid=catalog-part]").length>0')
  assert.ok(network.some(u => new URL(u).searchParams.get('keyword') === 'OIL FILTER'))
  assert.ok(network.some(u => new URL(u).searchParams.get('keyword') === 'Oil Filter'))
  await finish('lowercase multiword query searches both catalog casing conventions')

  await navigate('/parts-search?q=oil%20filter%20unknownword&mode=name')
  await wait("document.body.innerText.includes('No catalog records match')")
  await clickText('Search: filter')
  await wait('document.querySelectorAll("[data-testid=catalog-part]").length>0')
  await finish('multiword empty search offers explicit word search')

  await navigate('/parts-search?vin=BAD')
  await wait("document.body.innerText.includes('Enter a 17-character VIN')")
  assert.ok(!network.some(u => u.includes('/vehicles/search')))
  await finish('invalid VIN does not request catalog')

  await navigate('/parts-search?q=JACK&mode=name')
  await wait('document.querySelectorAll("[data-testid=catalog-part]").length>0')
  for (const [lang, label] of [['fr', 'Rechercher une pièce'], ['am', 'መለዋወጫ ይፈልጉ']]) {
    await evaluate(`localStorage.setItem('aa-language',${JSON.stringify(lang)})`)
    await send('Page.reload'); await wait(`document.body.innerText.includes(${JSON.stringify(label)}) && !!document.querySelector('[data-testid=catalog-part]')`)
  }
  await finish('French and Amharic search messages')
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  await evaluate("localStorage.setItem('aa-language','ar')")
  await send('Page.reload'); await wait("document.documentElement.dir==='rtl' && !!document.querySelector('[data-testid=catalog-part]')")
  assert.ok(await evaluate('document.documentElement.scrollWidth <= window.innerWidth + 2'))
  const mobile = await send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(out + '/arabic-mobile.png', Buffer.from(mobile.data, 'base64'))
  await finish('Arabic RTL mobile search layout')
  }
  fs.writeFileSync(out + (process.env.AAP_SHOP_ONLY ? '/shop-browser-evidence.json' : '/browser-evidence.json'), JSON.stringify({ checkedUTC: new Date().toISOString(), results: evidence }, null, 2))
  await send('Browser.close')
} catch (error) {
  console.error(error)
  fs.writeFileSync(out + '/partial-evidence.json', JSON.stringify(evidence, null, 2))
  process.exitCode = 1
} finally { ws?.close(); browser.kill('SIGTERM') }
