# Voice note: vehicle coverage requirements — 7 November 2026

Status: plan approved on 9 November 2026. The user requested production testing and a one-page PDF list. See [verification findings](vehicle-coverage-verification-2026-11-09.md) and the [vehicle coverage PDF](product/Africa%20Autopart%20Vehicle%20Coverage%20-%202026-11-09.pdf). Application code has not been changed.

## Source and transcription method

- Recording: `/home/difre/Downloads/WhatsApp Ptt 2026-11-07 at 09.06.33.ogg`
- Duration: approximately 77.7 seconds; mono Opus audio.
- Analysis date: 9 November 2026.
- Local transcription: OpenAI Whisper `small`, `task=transcribe`, CPU, automatic language detection. Detected language: English; the greeting includes Kiswahili (“Mambo”). Translation was disabled.
- Tools were installed in `/home/difre/.venvs/whisper`, outside project dependencies. A bundled FFmpeg executable was linked into that environment. The model is cached in `/home/difre/.cache/whisper`.
- Original Whisper TXT, JSON, SRT, VTT and TSV outputs are alongside the recording in Downloads, using the same filename stem. They have not been edited.
- Focused second passes reviewed approximately 00:26–00:48 and 01:04–01:17.7. The transcript below adjusts punctuation/capitalisation and uses the clearer second-pass wording in the example sentence.
- This is a machine transcript, not a human-certified transcription. Unresolved speech is marked rather than guessed. The identifier near the end was recognised as “VINs” in the first pass and “VRNs” in the focused pass. A following phrase was unreliable/omitted between passes.

## Complete reviewed transcript

**00:00–00:11**

> Hello guys, Mambo. How are you guys doing? Fred, there's something I need from you in Africa Auto Part.

**00:11–00:26**

> Fred, I need a list of all the vehicles, all the vehicle brands, models and descriptions that we can search and find their parts that are in Africa Auto Part, end to end.

**00:26–00:47**

> I need a list. So for example, I need you to tell me, Frank, at this particular moment, we can search and find all the parts that are Nissan Note from 2017 to 2021 of left wheel drive type.

**00:48–00:58**

> I need such type of classification, and that includes the recent data that we had already incorporated into our system.

**00:58–01:06**

> So Joe, also help out in that. I need that before the end of the day. Try to give me that response before the end of the day.

**01:06–01:17.7**

> If you can also include the [unclear: “VINs” or “VRNs”], and maybe [unclear phrase, approximately 01:10–01:15]. If anything is not clear, reach out to me.

The timestamp ranges are approximate. The uncertain phrase must not be treated as an instruction to add screenshots, messages, exports or any other specific feature without confirmation.

## Explicit instructions and requested outcomes

| ID | Instruction | Qualification |
| --- | --- | --- |
| R1 | Produce a list of the vehicles whose parts can currently be searched and found in Africa Auto Part, end to end. | This is a request for a current coverage deliverable; no new UI or API feature is explicitly requested. |
| R2 | Include vehicle brands, models and descriptions. | “Descriptions” is not further defined. |
| R3 | Classify supported coverage using vehicle attributes such as the model, year range and “left wheel drive type.” | Nissan Note, 2017–2021 is an illustrative example, not evidence that this configuration is supported or an instruction to seed Nissan data. |
| R4 | Include recently incorporated system data. | Identify the intended seed batch/snapshot before claiming that the newest data is fully represented. |
| R5 | Include vehicle identifiers if possible. | Conditional request. The spoken identifier is unresolved: VINs versus VRNs. Do not silently substitute one for the other. |
| R6 | Fred should prepare the response, with Joe helping. | Coordination request; this analysis does not contact anyone. |
| R7 | Deliver the response before the end of the day. | Historical deadline in the recording. The filename suggests 7 November 2026, but the intended delivery date/timezone should be confirmed; analysis occurred on 9 November. |
| R8 | Contact the speaker if anything is unclear. | The questions below are for review. |

## Interpretations and proposed acceptance criteria

These are implementation/reporting recommendations, not additional words attributed to the speaker.

- Treat the deliverable as a coverage matrix of verified vehicle configurations. A useful grouping is make → model → series → supported years → steering side. Preserve further distinctions such as engine, transmission, body and market when they change fitment.
- Interpret “left wheel drive” provisionally as left-hand steering (LHD), not drivetrain layout or 2WD/4WD. Confirm the terminology first.
- Define “descriptions” provisionally as series and fitment specifications supplied by the catalog. Do not invent descriptions from model names.
- Confirm that a representative production frontend search returns parts for each reported configuration. API existence, VIN decoding alone, static brand logos and fallback search results are insufficient evidence of an exact catalog match.
- Distinguish “catalog has matching part records” from “every part for the vehicle is covered” and from “parts are in stock.” The recording's phrase “all the parts” needs a coverage definition before making a completeness claim.
- Do not infer continuous support for every year between two observed years or from a production-year range alone. Keep gaps and unknown steering/year metadata visible.
- If approved, include matching catalog-row counts, example identifiers, source/seed-batch evidence, verification timestamps and test search links/results. Label counts as rows versus distinct part numbers.
- PDF/CSV/website exports, screenshots, image audits, new routes and UI changes are not explicit requirements from the intelligible speech. Choose deliverable format after review.

Proposed matrix columns:

`Make | Model | Series | Verified years/range | Steering | Description/fitment | Matching catalog rows | Example identifier(s) | Verification method/time | Source/seed batch | Gaps`

## Existing implementation: repository evidence

This assessment is based on the current checkout. No new production data audit was performed for this voice-note task. The earlier reports are dated evidence, not proof of current November coverage.

| Requested outcome / capability | Current status | Verified evidence and gap |
| --- | --- | --- |
| Browse available brands and models | Implemented foundation | `src/frontend/src/api/catalogApi.ts` has `getMakes()` and `getModelsByMake()`. `src/frontend/src/pages/BrandPage.tsx` loads all reported model pages for a selected make. `HomePage.tsx` loads makes/models. This is browsing, not an exhaustive classified coverage report. |
| Search and find matching parts | Implemented, needs scenario verification | `HomePage.tsx` calls VIN lookup followed by unified search; it can fall back to make/model search. `PartsSearchPage.tsx` supports VIN, keyword and make/model routes, pagination and filters. Report evidence must distinguish exact matches from broader fallback results. |
| Provide brands/models/descriptions and fitment | Partially implemented | `src/frontend/src/types/catalog.ts` defines make, model, model year, series, body, engine, transmission and market. These are optional/nullable in several places, so field presence cannot be assumed for every live configuration. |
| Describe year ranges and steering | Partially implemented | `CatalogPartItem` has `steering`, `compatibilityStartYear` and `compatibilityEndYear`; `VehicleSearchParams` accepts year/steering filters. The part detail modal in `PartsSearchPage.tsx` displays steering and compatibility years. There is no complete configuration/coverage summary view. |
| Confirm full current coverage including the recent seed | Not established | The frontend calls runtime backend endpoints, but the checkout has no database, seed manifest or backend import verification. `source`/`createdAt` are optional catalog fields. `getVehicleModels()` loads only the first make/model pages and must not be used as an exhaustive audit when those lists paginate. |
| Include VINs | Implemented foundation, pending spoken-term confirmation | Catalog types and search methods include VINs, and the part detail modal displays catalog VIN data. This does not establish every VIN's current coverage. |
| Include VRNs (registration numbers), if that is what was said | Not found in inspected catalog flow | No registration-number lookup field/method was found in the inspected catalog types, API wrapper or search flow. A VRN requirement would need a separate data/API agreement. |
| Produce the requested complete list/report | Partial historical work only | `docs/product/Africa Autopart Report 1.pdf` and `Africa Autopart Report 2.pdf` exist. Report 2 contains 30 October production observations and archive comparisons. Neither establishes all current configurations split by year and steering. No catalog coverage export/report route was found in the inspected application. |

Relevant UI routes are declared in `src/frontend/src/router/index.tsx`: `/`, `/brands/:make`, `/brands/:make/models/:model/parts`, and `/parts-search`.

## Practical implementation plan for review

### Phase 1 — agree on the deliverable and evidence

1. Resolve the identifier and final unclear phrase with the speaker; confirm the revised deadline and output format.
2. Agree on what “supported” and “all parts” mean. Propose reporting configurations with verified matching catalog records, with completeness/stock claims requiring separate evidence.
3. Ask the backend owner for the recent import batch identifier/manifest and, preferably, a distinct configuration export including make, model, series, years, steering and fitment.

### Phase 2 — collect current coverage without changing the application

4. Enumerate every page of makes and models from the agreed production catalog. Use exact make/model routes to avoid substring overlaps.
5. Obtain all distinct configurations via the backend export/aggregation if available. Otherwise collect all necessary paginated part metadata, with bounded requests, and record the snapshot time. A first-page sample is not a complete inventory.
6. Group by the agreed fitment attributes. Separate LHD, RHD and unknown values; separate different series/engines where required. Retain source/seed-batch provenance and unknown fields.
7. Reconcile the recent seed manifest and supplied archive with the live configurations. Explain omissions or changed row counts instead of assuming all source data is published.

### Phase 3 — verify the actual user journey

8. Run representative production frontend searches for each configuration and example identifier, including year/steering distinctions. Capture the returned configuration, matching part evidence, date and any fallback behavior.
9. Check zero-result, unknown-metadata and unsupported examples. Do not list successful broad fallback results as proof of an exact identifier match.
10. Reconcile model totals and configuration totals while handling overlapping fitments and duplicate part rows explicitly. Produce a separate exceptions list.

### Phase 4 — prepare the reviewed deliverable

11. Present the coverage matrix and gaps to the user and backend owner for review.
12. Produce the approved format (for example, a further PDF plus a spreadsheet) after agreement. Update application code only if separately approved and necessary to address a demonstrated gap.

## Implementation / delivery checklist

- [x] Access and transcribe the actual recording locally.
- [x] Save original timestamped Whisper output outside project dependencies.
- [x] Review unclear passages with focused transcription passes.
- [x] Document uncertainty instead of inventing speech.
- [x] Separate explicit instructions from proposed interpretations.
- [x] Inspect existing frontend support and document gaps.
- [x] Prepare a proposed plan without changing application code.
- [ ] Confirm VINs versus VRNs and the remaining unclear phrase.
- [ ] Confirm output format, definitions and revised deadline.
- [ ] Identify the latest seed batch and intended production snapshot.
- [ ] Collect every distinct supported configuration, with provenance.
- [ ] Verify the live frontend journeys and record exact versus fallback matches.
- [ ] Reconcile missing/unknown coverage with the backend owner.
- [ ] Review the completed coverage matrix and approve the final deliverable.

## Outstanding questions

1. Did the speaker say **VINs** (chassis identifiers) or **VRNs** (registration numbers)? What was the phrase after “and maybe” at approximately 01:10–01:15?
2. Is the requested response a PDF continuation of Reports 1 and 2, a spreadsheet/list, an in-app view, or another format?
3. Does “all parts” mean any searchable catalog coverage, every cataloged component for a configuration, or commercially available/in-stock parts? What evidence is required for completeness?
4. Should the Nissan Note 2017–2021 example be treated only as an illustration, or does the speaker also expect that actual vehicle to be supported?
5. Does “left wheel drive” mean LHD? Must the deliverable classify both LHD and RHD coverage?
6. Which seed batch counts as the “recent data,” and what manifest/configuration export can Joe/the backend owner provide?
7. What level of description is expected: series and body style only, or engine, transmission, fuel and market variants too?
8. What is the revised delivery deadline, since the note requests end-of-day and its filename is dated 7 November while this review is on 9 November 2026?

## Work boundary

Only this requirements document was added to the repository for this task. Application code and project dependency manifests were not changed. No implementation is authorised by this document itself; the transcript and plan are presented for review first.
