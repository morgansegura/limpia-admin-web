import { apiFetch } from "@/lib/api";

export function fetchMinimumWage(state: string) {
  return apiFetch<{ minimumWage: number }>(
    `/utilities/minimum-wage?state=${state}`,
  );
}

export function fetchSquareFootage(street: string, zip: string) {
  return apiFetch<{ squareFootage: number }>(
    `/utilities/square-footage?street=${encodeURIComponent(street)}&zip=${zip}`,
  );
}

export function fetchPriceEstimate(params: {
  cleaningType: string;
  squareFootage: number;
  state: string;
}) {
  return apiFetch<{ price: number; source: string }>(`/utilities/price`, {
    method: "POST",
    body: JSON.stringify(params),
  });
}
