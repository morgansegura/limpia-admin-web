"use client";

import { fakeEstimates } from "@/lib/utils/fake-estimates";
import {
  calculateCleaningPrice,
  calculateCleaningTime,
} from "@/lib/utils/estimate";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TestEstimateResults() {
  return (
    <div className="p-6 grid gap-6">
      <h1 className="text-2xl font-bold">Test Estimate Results</h1>

      {fakeEstimates.map((inputs, i) => {
        const time = calculateCleaningTime(inputs);
        const price = calculateCleaningPrice(inputs);
        const hourlyRate = (price / time).toFixed(2);
        const sqftRate = (price / inputs.sqft).toFixed(4);

        return (
          <Card key={i}>
            <CardContent className="p-4 grid gap-2">
              <strong>Test Case {i + 1}</strong>
              <div>Square Footage: {inputs.sqft}</div>
              <div>Type: {inputs.type_house ? "House" : "Apartment"}</div>
              <div>Freq QWS: {inputs.freq_qws ? "Yes" : "No"}</div>
              <div>Freq W: {inputs.freq_w ? "Yes" : "No"}</div>
              <div>
                Rotation Flags:{" "}
                {Object.entries(inputs)
                  .filter(([key]) => key.startsWith("rot_"))
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(", ")}
              </div>
              <Separator />
              <div>🕒 Cleaning Time: {time} hrs</div>
              <div>💲 Estimated Price: ${price}</div>
              <div>📈 Price per Hour: ${hourlyRate}</div>
              <div>📏 Price per SqFt: ${sqftRate}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
