import urlJoin from "url-join";

export class ApacheDir {
  constructor(public name: string, public url: string, public parent: ApacheDir | null = null) {}

  public getUrl(): string {
    let url = this.url;
    let parent = this.parent;

    while (parent !== null) {
      url = urlJoin(parent.url, url);
      parent = parent.parent;
    }

    return url;
  }
}
