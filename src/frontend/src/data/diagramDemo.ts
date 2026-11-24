// Review-only snapshot from the public catalog, 17 November 2026.
// Regions were drawn manually against the bundled 600x820 PNG; they are not backend hotspots.
export type DiagramRect = { x: number; y: number; width: number; height: number }
export type DiagramDemoPart = {
  id: number
  callout: string
  partNumber: string
  name: string
  quantity: number | null
  apiPrice: number | null
  object: DiagramRect
  label: DiagramRect
}

export const demoDiagram = {
  id: 'creta-tools-153294-review-v1',
  width: 600,
  height: 820,
  referenceVin: 'MALC281CBLM594521',
  imageUrl: 'https://pub-fe521ed9c6f443aa86b837606ac2fbf2.r2.dev/africaautopart/153294.png',
  snapshotDate: '2026-11-17',
} as const

export const demoParts: DiagramDemoPart[] = [
  {
    "id": 16673,
    "callout": "09110",
    "partNumber": "09110A0000",
    "name": "Jack Assembly",
    "quantity": 1,
    "apiPrice": 5.0,
    "object": {
      "x": 116,
      "y": 468,
      "width": 158,
      "height": 111
    },
    "label": {
      "x": 202,
      "y": 419,
      "width": 49,
      "height": 23
    }
  },
  {
    "id": 16674,
    "callout": "09127B",
    "partNumber": "0912726500",
    "name": "Label",
    "quantity": 1,
    "apiPrice": 5.0,
    "object": {
      "x": 236,
      "y": 484,
      "width": 34,
      "height": 35
    },
    "label": {
      "x": 230,
      "y": 457,
      "width": 59,
      "height": 22
    }
  },
  {
    "id": 16675,
    "callout": "09131",
    "partNumber": "091313B010",
    "name": "Wheel Nut Wrench",
    "quantity": 1,
    "apiPrice": 5.0,
    "object": {
      "x": 85,
      "y": 277,
      "width": 130,
      "height": 58
    },
    "label": {
      "x": 135,
      "y": 260,
      "width": 52,
      "height": 22
    }
  },
  {
    "id": 16676,
    "callout": "09132",
    "partNumber": "091323B000",
    "name": "Rod",
    "quantity": 1,
    "apiPrice": 5.0,
    "object": {
      "x": 209,
      "y": 276,
      "width": 118,
      "height": 76
    },
    "label": {
      "x": 239,
      "y": 266,
      "width": 50,
      "height": 22
    }
  },
  {
    "id": 16677,
    "callout": "09146",
    "partNumber": "0914611110",
    "name": "Screw Blade",
    "quantity": 1,
    "apiPrice": 5.0,
    "object": {
      "x": 348,
      "y": 289,
      "width": 86,
      "height": 60
    },
    "label": {
      "x": 360,
      "y": 274,
      "width": 49,
      "height": 22
    }
  },
  {
    "id": 16678,
    "callout": "09147A",
    "partNumber": "091471C000",
    "name": "Traction Hook",
    "quantity": 1,
    "apiPrice": 5.0,
    "object": {
      "x": 452,
      "y": 309,
      "width": 58,
      "height": 36
    },
    "label": {
      "x": 451,
      "y": 277,
      "width": 58,
      "height": 22
    }
  },
  {
    "id": 16679,
    "callout": "09149C",
    "partNumber": "09149A0100",
    "name": "Tool Box",
    "quantity": 1,
    "apiPrice": 5.0,
    "object": {
      "x": 330,
      "y": 470,
      "width": 192,
      "height": 151
    },
    "label": {
      "x": 400,
      "y": 436,
      "width": 60,
      "height": 22
    }
  }
]
