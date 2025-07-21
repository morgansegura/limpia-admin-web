export type EstimateInputs = {
  sqft: number;
  type_house: number; // 1 = House, 0 = Apartment
  freq_qws: number;
  freq_w: number;
  rot_1: number;
  rot_4: number;
  rot_a: number;
  rot_p: number;
  rot_2: number;
};

export function calculateCleaningTime(inputs: EstimateInputs): number {
  const {
    sqft,
    type_house,
    freq_qws,
    freq_w,
    rot_1,
    rot_4,
    rot_a,
    rot_p,
    rot_2,
  } = inputs;

  return parseFloat(
    (
      0.5165 +
      0.000352 * sqft +
      0.0882 * type_house +
      0.1557 * freq_qws +
      0.0161 * freq_w -
      0.0478 * rot_1 +
      0.0051 * rot_4 +
      0.1234 * rot_a +
      0.0401 * rot_p +
      0.1763 * rot_2
    ).toFixed(2),
  );
}

export function calculateCleaningPrice(inputs: EstimateInputs): number {
  const {
    sqft,
    type_house,
    freq_qws,
    freq_w,
    rot_1,
    rot_4,
    rot_a,
    rot_p,
    rot_2,
  } = inputs;

  return parseFloat(
    (
      114.87 +
      0.0343 * sqft +
      10.38 * type_house +
      12.71 * freq_qws +
      6.84 * freq_w -
      5.79 * rot_1 +
      2.73 * rot_4 +
      17.09 * rot_a +
      7.15 * rot_p +
      16.34 * rot_2
    ).toFixed(0),
  );
}
