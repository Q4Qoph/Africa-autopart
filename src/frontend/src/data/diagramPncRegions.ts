import cretaTools from '@/assets/demo/creta-tools.png'
import cretaMesTools from '@/assets/demo/creta-mes-tools.png'
import viosVentilation from '@/assets/demo/vios-ventilation.png'
import cretaCrossMemberImage from '@/assets/demo/creta-cross-member.png'
import fortunerImage from '@/assets/demo/fortuner-ventilation.png'
import crossMemberImage from '@/assets/demo/santa-fe-cross-member.png'
import panelImage from '@/assets/demo/santa-fe-panel.png'
import speakerImage from '@/assets/demo/santa-fe-panel-speaker.png'

interface ReviewedSheet {
  image: string
  width: number
  height: number
  vins: readonly string[]
  labels: { pnc: string; box: number[] }[]
}

// Coordinates are in source PNG pixels. Pin the artwork and catalog scope together.
export const diagramImageOrigin = 'https://pub-fe521ed9c6f443aa86b837606ac2fbf2.r2.dev/africaautopart/'
export const santaFeVin = 'KMHS281D9LU290945'

const reviewedSheets = new Map<string, ReviewedSheet>([
  [diagramImageOrigin + '32453.png', {
    image: cretaCrossMemberImage, width: 600, height: 820, vins: ['MALC281CBLM594521', 'MALC281C7LM591338'],
    labels: [
      { pnc: '62401', box: [257, 17, 44, 18] },
      { pnc: '13270A', box: [80, 99, 56, 18] },
      { pnc: '62618B', box: [373, 122, 56, 17] },
      { pnc: '55448', box: [489, 273, 48, 18] },
      { pnc: '54564B', box: [302, 325, 56, 18] },
      { pnc: '21874B', box: [234, 412, 57, 16] },
      { pnc: '54584A', box: [475, 410, 56, 18] },
      { pnc: '54501A', box: [240, 495, 55, 15] },
      { pnc: '54500', box: [250, 510, 45, 15] },
      { pnc: '54551D', box: [320, 558, 55, 18] },
      { pnc: '54519', box: [492, 538, 45, 18] },
      { pnc: '54530C', box: [496, 604, 56, 17] },
      { pnc: '54563B', box: [461, 675, 57, 18] },
    ],
  }],
  [diagramImageOrigin + '121399.png', {
    image: fortunerImage, width: 1592, height: 1099, vins: ['MHFKB8FS8L0087472', 'MHFKB8FS3L0087475'],
    labels: [
      { pnc: '12261', box: [750, 165, 70, 29] },
      { pnc: '12262A', box: [491, 493, 85, 29] },
      { pnc: '12262A', box: [985, 252, 85, 29] },
      { pnc: '12262B', box: [933, 774, 85, 29] },
    ],
  }],
  [diagramImageOrigin + '265157.png', {
    image: crossMemberImage, width: 3308, height: 2260, vins: [santaFeVin],
    labels: [
      { pnc: '1022AA', box: [1046, 2135, 152, 36] },
      { pnc: '1140AJ', box: [2222, 22, 152, 36] },
      { pnc: '1140AJ', box: [2079, 2170, 152, 36] },
      { pnc: '1351JD', box: [1234, 2045, 152, 36] },
      { pnc: '1430AA', box: [1024, 1956, 152, 36] },
      { pnc: '21874B', box: [2566, 1155, 152, 36] },
      { pnc: '22450', box: [2499, 1222, 125, 36] },
      { pnc: '28696A', box: [2655, 1101, 152, 36] },
      { pnc: '54500', box: [2199, 1374, 125, 36] },
      { pnc: '54501A', box: [2190, 1410, 152, 36] },
      { pnc: '54519B', box: [2508, 1790, 152, 36] },
      { pnc: '54530C', box: [2530, 1924, 152, 36] },
      { pnc: '54551D', box: [1971, 1956, 152, 36] },
      { pnc: '54562D', box: [1346, 1965, 152, 36] },
      { pnc: '54563B', box: [1743, 1696, 152, 36] },
      { pnc: '54564B', box: [1538, 1096, 152, 36] },
      { pnc: '54584A', box: [2119, 1539, 152, 36] },
      { pnc: '62401', box: [1305, 18, 125, 36] },
      { pnc: '62466', box: [2034, 828, 125, 36] },
      { pnc: '62466A', box: [2508, 747, 152, 36] },
      { pnc: '62467', box: [2025, 908, 125, 36] },
      { pnc: '62471', box: [2521, 354, 125, 36] },
      { pnc: '62472', box: [2195, 224, 125, 36] },
      { pnc: '62476', box: [2673, 989, 125, 36] },
      { pnc: '62477', box: [2673, 1025, 125, 36] },
      { pnc: '62618B', box: [2441, 81, 152, 36] },
      { pnc: '62618B', box: [2021, 1002, 152, 36] },
      { pnc: '62618B', box: [796, 1848, 152, 36] },
    ],
  }],
  [diagramImageOrigin + '139962.png', {
    image: panelImage, width: 3308, height: 2260, vins: [santaFeVin],
    labels: [
      { pnc: '1018AD', box: [1108, 1105, 177, 65] },
      { pnc: '94002G', box: [1317, 229, 170, 61] },
      { pnc: '94002G', box: [2690, 229, 170, 61] },
      { pnc: '94120A', box: [696, 645, 170, 61] },
      { pnc: '94120A', box: [2070, 645, 170, 61] },
      { pnc: '94360D', box: [383, 761, 170, 61] },
      { pnc: '94360D', box: [1758, 761, 170, 61] },
      { pnc: '94363A', box: [423, 1157, 170, 61] },
      { pnc: '94363A', box: [1799, 1157, 170, 61] },
      { pnc: '94365B', box: [1340, 326, 170, 61] },
      { pnc: '94365B', box: [2715, 326, 170, 61] },
    ],
  }],
  [diagramImageOrigin + '63871.png', {
    image: speakerImage, width: 1656, height: 2260, vins: [santaFeVin],
    labels: [{ pnc: '96360M', box: [378, 1203, 163, 45] }],
  }],
  [diagramImageOrigin + '153294.png', {
    image: cretaTools, width: 600, height: 820, vins: ['MALC281CBLM594521'],
    labels: [
      { pnc: '09131', box: [132, 258, 49, 24] },
      { pnc: '09132', box: [237, 266, 49, 23] },
      { pnc: '09146', box: [357, 268, 49, 23] },
      { pnc: '09147A', box: [450, 278, 55, 24] },
      { pnc: '09110', box: [201, 419, 49, 23] },
      { pnc: '09127B', box: [227, 457, 60, 21] },
      { pnc: '09149C', box: [399, 436, 61, 23] },
    ],
  }],
  [diagramImageOrigin + '62472.png', {
    image: cretaMesTools, width: 600, height: 820, vins: ['MALC281C7LM591338'],
    labels: [
      { pnc: '09131', box: [138, 264, 46, 22] },
      { pnc: '09132', box: [242, 270, 48, 24] },
      { pnc: '09146', box: [361, 273, 52, 23] },
      { pnc: '09147A', box: [465, 275, 57, 24] },
      { pnc: '09110', box: [212, 391, 49, 22] },
      { pnc: '09127B', box: [240, 430, 58, 24] },
      { pnc: '09149C', box: [399, 392, 58, 24] },
    ],
  }],
  [diagramImageOrigin + '121071.png', {
    image: viosVentilation, width: 760, height: 1112, vins: ['MHFB29F34H2016909'],
    labels: [
      { pnc: '12261', box: [244, 48, 74, 27] },
      { pnc: '12262B', box: [374, 34, 90, 26] },
      { pnc: '12261A', box: [150, 165, 87, 28] },
      { pnc: '12204', box: [163, 211, 74, 28] },
      { pnc: '12204A', box: [164, 255, 90, 27] },
      { pnc: '12261B', box: [555, 218, 91, 28] },
      { pnc: '12262A', box: [499, 697, 90, 28] },
      { pnc: '12262A', box: [265, 801, 91, 29] },
      { pnc: '12262', box: [451, 763, 77, 28] },
    ],
  }],
])

// Both Creta catalog URLs contain byte-identical artwork.
reviewedSheets.set(diagramImageOrigin + '247974.png', reviewedSheets.get(diagramImageOrigin + '32453.png')!)

export function getReviewedSheet(url: string, referenceVin: string) {
  const sheet = reviewedSheets.get(url)
  return sheet?.vins.includes(referenceVin) ? sheet : undefined
}
