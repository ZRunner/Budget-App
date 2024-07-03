import { Transfer } from "../types";

export function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function isTransfer(object: unknown): object is Transfer {
  return typeof object === "object" && object !== null &&
         typeof (object as Transfer).id === "number" &&
         typeof (object as Transfer).name === "string" &&
         typeof (object as Transfer).amount === "number" &&
         typeof (object as Transfer).category === "number";
}