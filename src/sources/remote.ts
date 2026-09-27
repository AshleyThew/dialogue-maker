// Sources fetched from a URL at startup. Each one replaces the bundled source
// of the same name once it loads; if the fetch fails the bundled copy is kept.
export interface RemoteSource {
  url: string;
  // Turns the fetched JSON into the source's value (a list or a map).
  transform?: (data: any) => string[] | { [key: string]: any };
}

export const remoteSources: { [key: string]: RemoteSource } = {
  // The release asset itself sends no CORS header, so read the copy CI mirrors
  // to the manifest branch.
  skins: {
    url: 'https://raw.githubusercontent.com/AshleyThew/minescape-skins/manifest/manifest.json',
    transform: (manifest) =>
      Object.keys(manifest?.skins ?? {}).sort((a, b) => a.localeCompare(b)),
  },
};

export const fetchRemoteSource = async (source: RemoteSource) => {
  const response = await fetch(source.url);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return source.transform ? source.transform(data) : data;
};
