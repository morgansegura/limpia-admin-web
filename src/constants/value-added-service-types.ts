export const VALUE_ADDED_SERVICE_TYPES = [
  "Inside Fridge",
  "Inside Oven",
  "Interior Windows",
  "Laundry Folding",
  "Dishwashing",
  "Garage Sweep",
  "Pet Hair Removal",
  "Balcony Clean",
  "Blinds Dusting",
  "Baseboard Detail",
  "Wall Spot Cleaning",
  "Extra Bedroom",
  "Extra Bathroom",
] as const;

export type ValueAddedServiceType = (typeof VALUE_ADDED_SERVICE_TYPES)[number];
