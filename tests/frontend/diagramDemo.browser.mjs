// Run against a local Vite app. This performs catalog reads only.
// CHROMIUM_PATH=/path/to/chrome AAP_TEST_URL=http://127.0.0.1:5175 node tests/frontend/catalogSearch.browser.mjs
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import assert from 'node:assert/strict'
const base = process.env.AAP_TEST_URL || 'http://127.0.0.1:5175'
if (!process.env.CHROMIUM_PATH) throw new Error('Set CHROMIUM_PATH to the Chromium executable')
const out = process.env.AAP_TEST_OUTPUT || '/tmp/aap-diagram-demo-checks'
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
  const navigate = async path => { network = []; responses = []; errors = []; await send('Page.navigate', { url: base + path }); await wait('document.querySelectorAll("[data-part-id]").length===7') }
  const field = async (selector, value) => {
    await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)}); if(!el)throw new Error('Missing field');const proto=el.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(el,${JSON.stringify(value)});el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}))})()`)
    await sleep(50)
  }
  const clickText = async label => evaluate(`(()=>{const b=Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()===${JSON.stringify(label)});if(!b)throw new Error('Missing button '+${JSON.stringify(label)});b.click()})()`)
  const cards = () => evaluate('document.querySelectorAll("[data-testid=catalog-part]").length')
  const finish = async name => { await sleep(100); assert.equal(errors.length, 0, errors.join('\n')); evidence.push({ name, url: await evaluate('location.href'), text: await text(), network: [...network], responses: [...responses], retried }); console.log('PASS', name) }
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable')
  await send('Network.setBlockedURLs', { urls: ['*youtube.com*', '*googlevideo.com*'] })

  await navigate('/demo/parts-diagram')
  await wait('!!document.querySelector("svg image") && performance.getEntriesByType("resource").some(r=>r.name.includes("creta-tools"))')
  assert.equal(await evaluate('document.querySelectorAll("[data-region-id]").length'),7)
  assert.equal(network.length,0)
  await finish('Seven mapped parts render with bundled image and no initial API dependency')

  await evaluate('document.querySelector("#demo-part-16678").click()')
  assert.equal(await evaluate('document.querySelector("#demo-region-16678").getAttribute("aria-pressed")'),'true')
  await finish('List selection frames corresponding physical object')

  // Use actual pointer input in transformed SVG coordinates.
  const clickRegion = async id => {
    const point=await evaluate(`(()=>{const el=document.querySelector('[data-region-id="${id}"]');const b=el.getBBox();const p=new DOMPoint(b.x+b.width/2,b.y+b.height/2).matrixTransform(el.getScreenCTM());return {x:p.x,y:p.y}})()`)
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',...point})
    await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point})
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point})
    await sleep(100)
  }
  await clickRegion(16675)
  assert.equal(await evaluate('document.querySelector("#demo-part-16675").getAttribute("aria-pressed")'),'true')
  await finish('Clicking physical diagram object highlights corresponding list row')

  await evaluate('document.querySelector("#demo-region-16677").focus()')
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13})
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13})
  assert.equal(await evaluate('document.querySelector("#demo-part-16677").getAttribute("aria-pressed")'),'true')
  await finish('Keyboard Enter selects accessible SVG region')

  await evaluate('document.querySelectorAll("input[type=radio]")[1].click()')
  assert.equal(await evaluate('document.querySelector("#demo-region-16673").getAttribute("width")'),'49')
  await clickRegion(16673)
  assert.equal(await evaluate('document.querySelector("#demo-part-16673").getAttribute("aria-pressed")'),'true')
  await finish('Callout mode uses independent label geometry with synchronized selection')

  await evaluate('document.querySelector("input[type=checkbox]").click()')
  assert.equal(await evaluate('document.querySelectorAll(".show-region").length'),0)
  assert.equal(await evaluate('document.querySelectorAll(".diagram-demo-region.is-selected").length'),1)
  await evaluate('document.querySelector("input[type=checkbox]").click()')
  await finish('Hidden idle hotspots retain selected red frame')

  await clickText('Review & adjust')
  await field('.diagram-demo-coordinate-fields input','205')
  assert.equal(await evaluate('document.querySelector("#demo-region-16673").getAttribute("x")'),'205')
  await field('.diagram-demo-coordinate-fields input','9999')
  assert.equal(await evaluate('document.querySelector("#demo-region-16673").getAttribute("x")'),'205')
  await clickText('Reset selected annotations')
  assert.equal(await evaluate('document.querySelector("#demo-region-16673").getAttribute("x")'),'202')
  await finish('Session annotation editing, bounds validation and reset')

  const downloadDir=out+'/downloads';fs.mkdirSync(downloadDir,{recursive:true})
  await send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloadDir})
  await clickText('Export review JSON')
  await sleep(500)
  const exportFile=downloadDir+'/creta-diagram-demo-review.json'
  assert.ok(fs.existsSync(exportFile))
  const exported=JSON.parse(fs.readFileSync(exportFile,'utf8'))
  assert.equal(exported.status,'demo-review-only');assert.equal(exported.parts.length,7)
  await finish('Review export contains explicit demo status and all mappings')

  await evaluate('document.querySelectorAll("input[type=radio]")[0].click()')
  await clickText('Close review tools')
  await evaluate('window.scrollTo(0,0)')
  const desktop=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});fs.writeFileSync(out+'/desktop.png',Buffer.from(desktop.data,'base64'))
  await evaluate('document.querySelector("#demo-zoom-in").click()')
  assert.ok((await evaluate('document.querySelector(".diagram-demo-svg").getAttribute("viewBox")')).includes('400'))
  await evaluate('document.querySelector("#demo-reset-view").click()')
  assert.equal(await evaluate('document.querySelector(".diagram-demo-svg").getAttribute("viewBox")'),'0 0 600 820')
  await finish('Zoom and reset retain image-space coordinates')


  // Move the view with real pointer input, then ensure dragging does not select another part.
  await clickText('Find selected')
  await wait('document.querySelector(".diagram-demo-svg").getAttribute("viewBox").split(" ")[2]==="300"')
  await evaluate('document.querySelector(".diagram-demo-svg").scrollIntoView({block:"center"})')
  const beforePan=await evaluate('document.querySelector(".diagram-demo-svg").getAttribute("viewBox")')
  const area=await evaluate('(()=>{const b=document.querySelector(".diagram-demo-svg").getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2}})()')
  await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...area})
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',buttons:1,x:area.x-35,y:area.y-40})
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,x:area.x-35,y:area.y-40})
  await wait(`document.querySelector('.diagram-demo-svg').getAttribute('viewBox')!==${JSON.stringify(beforePan)}`,5000)
  assert.equal(await evaluate('document.querySelector("#demo-part-16673").getAttribute("aria-pressed")'),'true')
  await finish('Zoomed panning moves the view without triggering accidental selection')
  await evaluate('document.querySelector("#demo-reset-view").click()')

  const fullscreen=await evaluate('(()=>{const b=document.querySelector("#demo-fullscreen").getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2}})()')
  await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...fullscreen})
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...fullscreen})
  await wait('!!document.fullscreenElement')
  await evaluate('document.exitFullscreen()')
  await wait('!document.fullscreenElement')
  await finish('Fullscreen opens and closes with shared selection')

  await clickText('Refresh live part data')
  await wait('document.body.innerText.includes("7/7 rows refreshed")')
  assert.equal(network.filter(url=>url.includes('/api/vehicles/parts/')).length,7)
  await finish('All seven live catalog rows refresh through read-only detail endpoints')

  // Failure path: snapshot remains interactive when backend cannot be reached.
  await send('Network.setBlockedURLs',{urls:['*workers.dev*','*/api/vehicles/parts/*']})
  await clickText('Refresh live part data')
  await wait('document.body.innerText.includes("0/7 rows refreshed")')
  assert.equal(await evaluate('document.querySelectorAll("[data-part-id]").length'),7)
  await finish('API failure preserves usable snapshot and explains refresh result')

  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true})
  await send('Emulation.setTouchEmulationEnabled',{enabled:true})
  await evaluate('window.scrollTo(0,0)')
  assert.ok(await evaluate('document.documentElement.scrollWidth<=window.innerWidth+2'))
  assert.ok(await evaluate('document.querySelector(".diagram-demo-right").getBoundingClientRect().top>document.querySelector(".diagram-demo-left").getBoundingClientRect().top'))
  const point=await evaluate(`(()=>{const e=document.querySelector('[data-region-id="16679"]');const b=e.getBBox();const p=new DOMPoint(b.x+b.width/2,b.y+b.height/2).matrixTransform(e.getScreenCTM());return {x:p.x,y:p.y}})()`)
  // Scroll diagram into the viewport before touch.
  await evaluate('document.querySelector(".diagram-demo-left").scrollIntoView({block:"start"})')
  const touchPoint=await evaluate(`(()=>{const e=document.querySelector('[data-region-id="16679"]');const b=e.getBBox();const p=new DOMPoint(b.x+b.width/2,b.y+b.height/2).matrixTransform(e.getScreenCTM());return {x:p.x,y:p.y}})()`)
  await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touchPoint]})
  await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})
  await sleep(200)
  assert.equal(await evaluate('document.querySelector("#demo-part-16679").getAttribute("aria-pressed")'),'true')
  await evaluate('window.scrollTo(0,0)')
  const mobile=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});fs.writeFileSync(out+'/mobile.png',Buffer.from(mobile.data,'base64'))
  await finish('Mobile stacked layout, no horizontal overflow and touch-to-list selection')

  fs.writeFileSync(out+'/evidence.json',JSON.stringify({checkedUTC:new Date().toISOString(),results:evidence},null,2))
  await send('Browser.close')
} catch(error) {
  console.error(error);fs.writeFileSync(out+'/partial-evidence.json',JSON.stringify(evidence,null,2));process.exitCode=1
} finally { ws?.close();browser.kill('SIGTERM') }
