/**
 * @copyright 2026 MK-TS-04
 * @license Apache-2.0
 */
import dotenv from "dotenv";

dotenv.config();

const config = {
  VITE_API_URL: process.env.VITE_API_URL,
};

export default config;
