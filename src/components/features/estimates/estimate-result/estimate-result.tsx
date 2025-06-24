"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
  price: number;
  squareFootage: number;
  source: string;
  onCreateJob?: () => void;
  onSendEstimate?: () => void;
  onSignContract?: () => void;
};

export function EstimateResult({
  price,
  squareFootage,
  source,
  onCreateJob,
  onSendEstimate,
  onSignContract,
}: Props) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Estimate Result</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          <strong>Square Footage:</strong> {squareFootage} sq ft
        </p>
        <p>
          <strong>Estimated Price:</strong> ${price.toFixed(2)}
        </p>
        <p>
          <strong>Source:</strong> {source}
        </p>

        <div className="flex flex-col md:flex-row gap-2">
          <Button onClick={onCreateJob}>Create Job from Estimate</Button>
          <Button variant="outline" onClick={onSendEstimate}>
            Send to Customer
          </Button>
          <Button variant="secondary" onClick={onSignContract}>
            Sign Contract
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
