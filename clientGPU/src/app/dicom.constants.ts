import { Layout } from "./model/interfaces";

export const layouts: Layout[] = [
  {
    icon: 'layout_2',
    regions: 3,
    templateAreas: '"a b" "a c',
    areaIdentifiers: ['a', 'b', 'c']
  }
]

export const windowingPresets = [
  { name: 'Brain 80 / 40', ww: 80, wc: 40 },
  { name: 'Subdural 250 / 75', ww: 80, wc: 40 },
  { name: 'Stroke 40 / 40', ww: 40, wc: 40 },
  { name: 'Temporal bones 2800 / 600', ww: 2800, wc: 600 },
  { name: 'Soft tissues 375 / 40', ww: 375, wc: 40 },
  { name: 'Lungs 1500 / -600', ww: 1500, wc: -600 },
  { name: 'Mediastinum 350 / 50', ww: 350, wc: 50 },
  { name: 'Liver 150 / 30', ww: 150, wc: 30 },
  { name: 'Bone 1800 / 400', ww: 1800, wc: 400 },
]
