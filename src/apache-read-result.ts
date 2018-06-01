import { ApacheDir } from "./apache-dir";
import { ApacheFile } from "./apache-file";

export class ApacheReadResult {
  constructor(public dirs: ApacheDir[], public files: ApacheFile[]) {}
}
