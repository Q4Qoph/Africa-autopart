# Voice note: visible homepage vehicle coverage — 10 November 2026

Status: the user approved the backend-derived implementation plan. The homepage coverage panel is implemented locally; see [implementation and refresh notes](frontend/vehicle-coverage-panel.md). The original transcript and interpretation are preserved below.

## User clarification and researched recommendation

The user clarified that the project manager sent these instructions after reviewing the vehicle list. Resolve unclear spoken dates/steering labels using the verified backend data. This removes the need to guess example years or treat RWD as a steering category. Preserve the original transcript below as evidence of what the recogniser produced.

See the [researched implementation recommendation](frontend/vehicle-coverage-panel-plan.md) for code findings, accessibility references, the backend-derived display list, data freshness and the proposed responsive layout. The current baseline is the November 9 verified snapshot; no new application implementation has started.

## Recording and method

- Source: `/home/difre/Downloads/WhatsApp Ptt 2026-11-10 at 07.27.30.ogg`.
- Duration: approximately 102.3 seconds.
- Local OpenAI Whisper `small`, CPU, `task=transcribe`, automatic language detection; detected language: Swahili. Translation was disabled.
- Focused English-language comparison passes reviewed 00:44–01:12 and 01:16–01:34. These did not reliably resolve the mixed Kiswahili/Sheng model examples.
- Raw TXT/JSON/SRT/VTT/TSV outputs are alongside the recording in Downloads, with the same filename stem. The raw output has not been edited.
- The reviewed machine transcript below preserves intelligible wording and marks uncertain passages. It is not a human-certified verbatim transcription. In particular, the example years and several Kiswahili/Sheng words remain uncertain; they must not be converted into catalog facts.

## Reviewed transcript

**00:00–00:08**

> Fred, mambo. Okay, so for the vehicles that you shared with me, I need you to go to Africa Auto Part.

**00:08–00:13**

> You see that landing page, [unclear; probably “vile iko pale”].

“Vile iko pale,” if that is the intended phrase, means approximately “as it is there / as it currently looks.” The recogniser rendered it as “Vile Ecopale.”

**00:13–00:24**

> Can you just next to—I mean, just on the side—I need it to be something on the side and something that is very visible.

**00:25–00:40**

> I need you to just make like a simple note and say the following vehicle categories are currently covered inside the Africa Auto Part platform.

**00:41–00:48**

> And then give the category as follows. Just say Toyota, and then say I can click Toyota.

**00:48–00:54**

> [Unclear Kiswahili/Sheng phrase] categories [unclear] Toyota. [Unclear] Toyota Fortuner [example year range unclear].

Both passes produced the inconsistent sequence “2015 to 2013, 2017.” Do not guess a corrected range or use this sequence as supported vehicle data.

**00:54–01:05**

> [Unclear] Toyota Hilux 2014 to 2018. [Unclear Kiswahili/Sheng passage; another model/example and “2012 to 2015” were not reliably resolved].

The intelligible model/year examples illustrate the requested display format. They do not establish live coverage. The uncertain model in the latter part is deliberately not named here.

**01:05–01:12**

> [Unclear Kiswahili/Sheng passage mentioning Toyota, clicking Toyota, and its categories].

**01:12–01:23**

> So don't give information about the body type or anything. Just give category. Sana sana stick to the year of manufacturing and also the driving—the steering type. Is it LHD or RWD?

“Sana sana” means approximately “mainly / especially.” Both passes recognised “RWD.” Preserve the uncertainty in intended terminology: LHD/RHD describe steering side; RWD describes drivetrain. The preceding phrase is explicitly about steering.

**01:23–01:34**

> So do that and then add it to the website because I want us to have that clear. [Unclear Kiswahili/Sheng phrase] kwa website anajua. Like he said, okay, it does this.

The phrase “kwa website anajua” refers approximately to someone knowing/understanding something on the website; the surrounding words were not reliably transcribed.

**01:34–01:42.3**

> But at the moment, it's only able to cover this only. Can you do that and find a nice position for it? Find another place for it to be, to be clearly visible.

## Clear requirements

| ID | Requirement | Evidence |
| --- | --- | --- |
| R1 | Base the website coverage notice on the vehicle list already shared. | Opening reference to “the vehicles that you shared with me.” |
| R2 | Add a simple, clearly visible coverage element to the landing page, positioned on the side where suitable. | 00:13–00:40 and closing request. |
| R3 | State that the listed vehicle categories are currently covered by Africa Auto Part. | Suggested note at 00:25–00:40. |
| R4 | Make vehicle brands clickable, with Toyota as the example, so visitors can see its model/category entries. | 00:41–01:12. |
| R5 | Keep the entries focused on vehicle category/model, manufacturing years and steering type. | 01:12–01:23. |
| R6 | Exclude body-type details and other extensive vehicle specifications from this element. | Explicit “don't give information about the body type or anything.” |
| R7 | Make the platform's current limits obvious to visitors. | 01:23–01:42.3. |

## Interpretation, not additional speech

- “Categories” appears to mean make → vehicle model/year entries, rather than part assembly groups such as Body or Engine. The Toyota/Fortuner/Hilux examples support this interpretation.
- A compact expandable brand list is a suitable implementation: click a brand to reveal its model/year/steering entries. The speaker did not mandate an accordion, drawer, modal or navigation mechanism.
- On desktop, place the panel beside the main search area. On narrow screens, keep it prominently below the search area rather than hiding it in a desktop-only sidebar.
- Use LHD/RHD for steering labels if the speaker confirms that intention. Do not display RWD as a steering type or convert it to RHD without noting the terminology issue.
- Use verified catalog coverage data. Do not replace the verified Hilux range with the spoken illustrative range or guess the Fortuner years.
- The November 9 PDF separates backend compatibility ranges from observed model years. Confirm which of those the speaker wants labelled as “year of manufacturing” before publishing a potentially misleading year claim.
- No additional VIN, body, engine, gearbox, market, stock or pricing fields are requested for the compact panel. Existing catalog/detail screens can continue providing their established information.

Illustrative layout using two previously verified entries (not a complete proposed dataset):

```text
Currently covered vehicles
These vehicle categories currently have searchable parts.

Toyota  [expand]
  Fortuner     2016–2020    LHD
  Hilux        2011–2015    LHD
  …

Hyundai [expand]
  …
```

The displayed dates in this example are the November 9 catalog compatibility ranges, not proof of every year's complete parts coverage. Customer-facing wording must reflect the approved meaning.

## Existing code and reusable work

- `src/frontend/src/pages/HomePage.tsx` already contains the main search, live make loading and a clickable brand-logo grid. It does not contain the requested compact current-coverage notice or expandable model/year/steering list.
- `getDisplayBrands()` in that page combines a hardcoded logo list with backend makes. That combined list must not be used as evidence that every displayed brand has searchable parts.
- `src/frontend/src/pages/BrandPage.tsx` already loads model pages and links to model parts catalogs, but displays no coverage years/steering summary.
- `src/frontend/src/api/catalogApi.ts` exposes make/model/search calls. There is no distinct configuration/coverage aggregation wrapper. Downloading all 194 part pages on each homepage visit would be inappropriate.
- `src/frontend/src/types/catalog.ts` defines the series, model year, compatibility years and steering fields needed to build a coverage dataset.
- [November 9 verification](vehicle-coverage-verification-2026-11-09.md) and the [one-page coverage PDF](product/Africa%20Autopart%20Vehicle%20Coverage%20-%202026-11-09.pdf) provide the verified baseline: 2 makes, 7 models, 10 full configurations and 11 VINs, with all current catalog records labelled LHD at that snapshot.
- `src/frontend/src/components/layout/RootLayout.tsx` constrains the content width; the proposed sidebar should be fitted within the existing responsive layout.

## Proposed implementation after review

1. Resolve steering terminology and the meaning of displayed years. Keep unsupported illustrative values out of the data.
2. Build a small typed coverage dataset from the verified catalog, retaining distinct year ranges/steering labels and collapsing only duplicate display entries. Use a lightweight backend configuration endpoint if available; otherwise agree on a dated, maintained snapshot and refresh process. Do not load the full parts database in the homepage browser.
3. Add a focused `VehicleCoveragePanel` component using accessible expand/collapse controls for each supported make. Show model, approved years and steering only.
4. Place it beside the homepage search area on desktop and near the search on mobile, with a clear current-coverage message.
5. Verify keyboard interaction, mobile visibility, loading/empty/error states if the data is remote, and consistency with actual supported configurations. Run repository lint/build checks and document existing unrelated failures if present.
6. Present the visible result for review. Deployment requires a separate explicit instruction.

## Questions to resolve

1. **Resolved by the user's clarification:** use steering values from the backend rather than the uncertain spoken term. The verified snapshot contains LHD records.
2. **Resolved for the recommendation:** use backend catalog compatibility ranges, labelled as catalog years, rather than inventing manufacturing-year coverage from the spoken examples.
3. **Recommended interaction:** expand the make inline on the homepage. Optional model links can reuse existing model pages without claiming year/steering filters.
4. **Recommended data approach:** a dated snapshot generated from verified backend evidence initially, replaced by a lightweight aggregation endpoint when available. Refresh it when catalog data changes.

## Work completed

- [x] Transcribed the recording locally and retained timestamped raw output.
- [x] Reviewed uncertain mixed-language passages with a second pass.
- [x] Marked unresolved words and example years instead of inventing them.
- [x] Extracted the clear requirements and mapped them to existing components/data.
- [x] Prepared an application plan for review.
- [x] Confirm terminology, year semantics and interaction choice using the backend data and approved plan.
- [x] Implement the reviewed panel.
- [x] Verify the interface and capture desktop/mobile/Arabic screenshots.

At the initial transcription stage, only this follow-up document was added. Application work began after the user approved the researched plan; its scope and checks are documented in the implementation notes linked above.
