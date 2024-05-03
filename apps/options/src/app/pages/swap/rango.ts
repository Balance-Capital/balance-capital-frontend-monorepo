import { RangoClient } from "rango-sdk-basic";

export const RANGO_API_KEY = "46bf9bfe-560b-4bd7-9eb3-79c2bf7080cb";
export const REFERRER_ADDRESS = "0x05ff98dd8b5da02cb0687f090f41cd6a6d64783a"; // referrer address
export const REFERRER_FEE = "0.5"; // 1%
export const ESTIMATED_GAS_LIMIT = 1000000;
export const GAS_MULTIPLIER = 125; // 25%
export const rangoClient = new RangoClient(RANGO_API_KEY);
