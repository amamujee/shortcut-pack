import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const starterData = require("./starter-pack.cjs");

export const DEFAULT_CLI_PREFIX = starterData.DEFAULT_CLI_PREFIX;
export const emptyProfile = starterData.emptyProfile;
export const starterPack = starterData.starterPack;
export const buildGenericStarterEntries = starterData.buildGenericStarterEntries;
export const groupByCategory = starterData.groupByCategory;
