// src/data/fake-estimates.ts
import { EstimateInputs } from "@/lib/utils/estimate";

export const fakeEstimates: EstimateInputs[] = [
  {
    sqft: 1500,
    type_house: 1,
    freq_qws: 1,
    freq_w: 0,
    rot_1: 1, //
    rot_4: 0, //
    rot_a: 0, // Initial A -- Deep Clean
    rot_p: 0, // Partial
    rot_2: 0, //
  },
  {
    sqft: 850,
    type_house: 0,
    freq_qws: 0,
    freq_w: 1,
    rot_1: 0,
    rot_4: 0,
    rot_a: 0,
    rot_p: 0,
    rot_2: 1,
  },
  {
    sqft: 2400,
    type_house: 1,
    freq_qws: 1,
    freq_w: 0,
    rot_1: 0,
    rot_4: 0,
    rot_a: 0,
    rot_p: 1,
    rot_2: 0,
  },
  {
    sqft: 1800,
    type_house: 1,
    freq_qws: 0,
    freq_w: 1,
    rot_1: 0,
    rot_4: 0,
    rot_a: 0,
    rot_p: 0,
    rot_2: 1,
  },
  {
    sqft: 3000,
    type_house: 1,
    freq_qws: 0,
    freq_w: 0,
    rot_1: 0,
    rot_4: 1,
    rot_a: 0,
    rot_p: 0,
    rot_2: 0,
  },
];
