import { Transfer } from "../types";

export function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function isTransfer(object: any): object is Transfer {
  return typeof object.id === "number"
        && typeof object.name === "string"
        && typeof object.amount === "number"
        && typeof object.category === "number";
}