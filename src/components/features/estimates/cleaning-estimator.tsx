"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  calculateCleaningTime,
  calculateCleaningPrice,
  EstimateInputs,
} from "@/lib/utils/estimate";

export default function CleaningEstimator() {
  const [inputs, setInputs] = useState<EstimateInputs>({
    sqft: 0,
    type_house: 1,
    freq_qws: 0,
    freq_w: 0,
    rot_1: 1,
    rot_4: 0,
    rot_a: 0,
    rot_p: 0,
    rot_2: 0,
  });

  const handleChange = (field: keyof EstimateInputs, value: string) => {
    setInputs((prev) => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  };

  return (
    <div className="grid gap-6 p-4">
      <Card>
        <CardContent className="grid gap-4 p-4">
          {Object.entries(inputs).map(([key, value]) => (
            <div key={key} className="grid gap-1">
              <Label>{key}</Label>
              <Input
                type="number"
                value={value}
                onChange={(e) =>
                  handleChange(key as keyof EstimateInputs, e.target.value)
                }
              />
            </div>
          ))}

          <div className="grid gap-2 pt-4">
            <Button disabled>Calculate</Button>
            <div>
              <strong>Cleaning Time (hrs):</strong>{" "}
              {calculateCleaningTime(inputs)}
            </div>
            <div>
              <strong>Estimated Price ($):</strong>{" "}
              {calculateCleaningPrice(inputs)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
