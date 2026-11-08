#!/usr/bin/env node

export { main } from "./cli/main";
import { runCli } from "./cli/main";

if (require.main === module) runCli();
