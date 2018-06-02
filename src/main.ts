import { ApacheDir } from "./apache-dir";
import axios from "axios";
import { JSDOM } from "jsdom";
import { ApacheReadResult } from "./apache-read-result";
import { ApacheFile } from "./apache-file";
import urlJoin from "url-join";
import * as fs from "fs-extra";
import * as path from "path";

// config
const baseUrl = "http://sange.fi/esoteric/brainfuck/";
const recursive = true;
const outDir = "./out";

async function downloadApacheFile(url: string): Promise<Buffer> {
  console.log("Downloading: " + url);
  const response = await axios.get(url, {
    responseType: 'arraybuffer'
  });
  console.log("Downloaded: " + url);
  return response.data;
}

async function readApacheDir(url: string, parentDir: ApacheDir | null = null): Promise<ApacheReadResult> {
  const response = await axios.get(url);
  const document = (<any>new JSDOM(response.data).window)["document"] as Document;
  const dirs: ApacheDir[] = [];
  const files: ApacheFile[] = [];

  const rows = document.getElementsByTagName("tr");

  for (let i = 3; i < rows.length - 1; i++) {
    const row = rows.item(i);
    const cells = row.getElementsByTagName("td");

    const a = cells.item(1).getElementsByTagName("a").item(0);
    const link = a.getAttribute("href")!;
    const name = a.innerHTML;

    if (cells.item(0).getElementsByTagName("img").item(0).getAttribute("alt") === "[DIR]") {
      // folder
      dirs.push(new ApacheDir(name, link, parentDir));
    } else {
      // file
      files.push(new ApacheFile(name, link, parentDir));
    }
  }

  return new ApacheReadResult(dirs, files);
}

async function scrape(url: string, recursive: boolean, outDir: string, parentDir: ApacheDir | null = null): Promise<void> {
  const result = await readApacheDir(url, parentDir);
  result.files.forEach(async file => {
    const content = await downloadApacheFile(urlJoin(url, file.name));
    await fs.outputFile(path.join(outDir, file.getUrl()), content);
  });

  if (recursive) {
    result.dirs.forEach(async dir => {
      await scrape(urlJoin(url, dir.url), true, outDir, dir);
    });
  }
}

try {
  scrape(baseUrl, recursive, outDir).then(data => console.log("Completed scraping"));
} catch (err) {
  console.log(err);
}

