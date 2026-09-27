import * as React from 'react';
import styled from '@emotion/styled';

const SKINS_REPO = 'AshleyThew/minescape-skins';
const TREE_URL = `https://api.github.com/repos/${SKINS_REPO}/git/trees/main?recursive=1`;
const RAW_URL = `https://raw.githubusercontent.com/${SKINS_REPO}/main/`;
const SKIN_PATH = /^skins\/([^/]+)\/([^/]+?)(\.slim)?\.png$/;
const COLLAPSED_KEY = 'minescape.skinSidebar.collapsed';

interface SkinEntry {
  name: string;
  region: string;
  slim: boolean;
  url: string;
}

namespace S {
  export const Sidebar = styled.div<{ collapsed: boolean }>`
    position: relative;
    flex-shrink: 0;
    width: ${(p) => (p.collapsed ? '26px' : '250px')};
    background: rgb(20, 20, 20);
    color: white;
    font-family: Helvetica, Arial, sans-serif;
    font-size: 13px;
    text-align: left;
  `;

  // Absolutely filled so the long skin list scrolls inside the sidebar
  // instead of stretching the page.
  export const Inner = styled.div`
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `;

  export const Header = styled.div`
    display: flex;
    align-items: center;
    padding: 6px 8px;
    background: rgb(30, 30, 30);
    font-weight: bold;

    > span {
      flex-grow: 1;
    }
  `;

  export const IconButton = styled.button`
    background: rgb(60, 60, 60);
    border: none;
    color: white;
    cursor: pointer;
    border-radius: 3px;
    padding: 2px 7px;
    font-size: 12px;

    &:hover {
      background: rgb(0, 192, 255);
    }
  `;

  export const CollapsedTab = styled.button`
    position: absolute;
    inset: 0;
    border: none;
    background: rgb(20, 20, 20);
    color: white;
    cursor: pointer;
    writing-mode: vertical-rl;
    font: inherit;
    font-weight: bold;
    padding-top: 10px;
    text-align: start;

    &:hover {
      background: rgb(40, 40, 40);
    }
  `;

  export const Preview = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 6px 0;
    background: rgb(45, 45, 45);
    min-height: 300px;
    flex-shrink: 0;
  `;

  export const PreviewTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    padding: 0 8px;
    box-sizing: border-box;
    min-height: 22px;

    > span {
      flex-grow: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-weight: bold;
    }
  `;

  export const Meta = styled.div`
    color: #aaa;
    font-size: 11px;
    min-height: 14px;
  `;

  export const Filters = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px 8px;

    > input,
    > select {
      background: rgb(50, 50, 50);
      color: white;
      border: 1px solid rgb(70, 70, 70);
      border-radius: 3px;
      padding: 4px 6px;
      font: inherit;
    }
  `;

  export const List = styled.div`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  `;

  export const Item = styled.div<{ selected: boolean }>`
    padding: 2px 8px;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background: ${(p) => (p.selected ? 'rgb(0, 120, 170)' : 'transparent')};

    &:hover {
      background: ${(p) => (p.selected ? 'rgb(0, 120, 170)' : 'rgb(50, 50, 50)')};
    }
  `;

  export const Status = styled.div`
    padding: 8px;
    color: #aaa;
  `;
}

let skinsRequest: Promise<SkinEntry[]> | null = null;

// The repo tree lists every skin PNG in one request, and both the API and
// raw.githubusercontent.com allow browser reads.
const loadSkins = () => {
  if (!skinsRequest) {
    skinsRequest = fetch(TREE_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then((tree) =>
        (tree.tree as { path: string }[])
          .map((entry) => {
            const match = entry.path.match(SKIN_PATH);
            return match
              ? {
                  name: match[2],
                  region: match[1],
                  slim: !!match[3],
                  url: RAW_URL + entry.path,
                }
              : null;
          })
          .filter((entry): entry is SkinEntry => entry !== null)
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
    // Let a later expand retry after a failure.
    skinsRequest.catch(() => {
      skinsRequest = null;
    });
  }
  return skinsRequest;
};

const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSED_KEY) !== 'false';
  } catch {
    return true;
  }
};

const SkinPreview = ({ skin }: { skin: SkinEntry | null }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const viewerRef = React.useRef<import('skinview3d').SkinViewer | null>(null);
  const [ready, setReady] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  // skinview3d pulls in three.js, so load it only once the sidebar is opened.
  React.useEffect(() => {
    let disposed = false;
    import('skinview3d').then(({ SkinViewer, IdleAnimation }) => {
      if (disposed || !canvasRef.current) {
        return;
      }
      const viewer = new SkinViewer({
        canvas: canvasRef.current,
        width: 230,
        height: 270,
      });
      viewer.animation = new IdleAnimation();
      viewer.zoom = 0.85;
      viewerRef.current = viewer;
      setReady(true);
    });
    return () => {
      disposed = true;
      viewerRef.current?.dispose();
      viewerRef.current = null;
    };
  }, []);

  // Preload the image ourselves so a slow earlier skin can't overwrite the
  // one picked after it.
  React.useEffect(() => {
    if (!ready || !skin) {
      return;
    }
    let current = true;
    setFailed(false);
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      if (current && viewerRef.current) {
        viewerRef.current.loadSkin(image, {
          model: skin.slim ? 'slim' : 'default',
        });
      }
    };
    image.onerror = () => current && setFailed(true);
    image.src = skin.url;
    return () => {
      current = false;
    };
  }, [ready, skin]);

  return (
    <>
      <canvas ref={canvasRef} style={{ cursor: 'grab' }} />
      {failed && <S.Meta>Couldn't load this skin.</S.Meta>}
    </>
  );
};

export const SkinSidebar = () => {
  const [collapsed, setCollapsed] = React.useState(readCollapsed);
  const [skins, setSkins] = React.useState<SkinEntry[] | null>(null);
  const [error, setError] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [region, setRegion] = React.useState('');
  const [selected, setSelected] = React.useState<SkinEntry | null>(null);
  const [copied, setCopied] = React.useState(false);
  const listRef = React.useRef<HTMLDivElement>(null);

  const toggle = (value: boolean) => {
    setCollapsed(value);
    try {
      localStorage.setItem(COLLAPSED_KEY, String(value));
    } catch {}
  };

  React.useEffect(() => {
    if (collapsed || skins) {
      return;
    }
    setError('');
    loadSkins()
      .then(setSkins)
      .catch((e) => setError(`Couldn't load skins: ${e.message}`));
  }, [collapsed, skins]);

  const regions = React.useMemo(
    () => [...new Set((skins || []).map((skin) => skin.region))].sort(),
    [skins],
  );

  const filtered = React.useMemo(() => {
    const query = search.trim().toLowerCase().replace(/\s+/g, '_');
    return (skins || []).filter(
      (skin) =>
        (!region || skin.region === region) &&
        (!query || skin.name.toLowerCase().includes(query)),
    );
  }, [skins, search, region]);

  const select = (skin: SkinEntry) => {
    setSelected(skin);
    setCopied(false);
  };

  // Up/Down in the search box steps through the filtered list.
  const onSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') {
      return;
    }
    e.preventDefault();
    if (filtered.length === 0) {
      return;
    }
    const index = selected ? filtered.indexOf(selected) : -1;
    const step = e.key === 'ArrowDown' ? 1 : -1;
    const next =
      filtered[
        index === -1
          ? 0
          : Math.min(filtered.length - 1, Math.max(0, index + step))
      ];
    select(next);
    listRef.current
      ?.querySelector(`[data-skin="${next.name}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  };

  const copyName = () => {
    if (!selected) {
      return;
    }
    navigator.clipboard?.writeText(selected.name).then(() => setCopied(true));
  };

  if (collapsed) {
    return (
      <S.Sidebar collapsed>
        <S.CollapsedTab title="Show skin viewer" onClick={() => toggle(false)}>
          ◀ Skins
        </S.CollapsedTab>
      </S.Sidebar>
    );
  }

  return (
    <S.Sidebar collapsed={false}>
      <S.Inner>
        <S.Header>
          <span>Skins{skins ? ` (${filtered.length})` : ''}</span>
          <S.IconButton title="Hide skin viewer" onClick={() => toggle(true)}>
            ▶
          </S.IconButton>
        </S.Header>
        <S.Preview>
          <S.PreviewTitle>
            <span title={selected?.name}>
              {selected ? selected.name : 'Pick a skin'}
            </span>
            {selected && (
              <S.IconButton title="Copy skin name" onClick={copyName}>
                {copied ? 'Copied' : 'Copy'}
              </S.IconButton>
            )}
          </S.PreviewTitle>
          <S.Meta>
            {selected
              ? `${selected.region}${selected.slim ? ' · slim' : ''}`
              : ''}
          </S.Meta>
          <SkinPreview skin={selected} />
        </S.Preview>
        <S.Filters>
          <input
            placeholder="Search skins"
            value={search}
            spellCheck={false}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={onSearchKeyDown}
          />
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">All regions</option>
            {regions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </S.Filters>
        <S.List ref={listRef}>
          {error && <S.Status>{error}</S.Status>}
          {!error && !skins && <S.Status>Loading skins…</S.Status>}
          {filtered.map((skin) => (
            <S.Item
              key={skin.url}
              data-skin={skin.name}
              selected={skin === selected}
              title={skin.name}
              onClick={() => select(skin)}
            >
              {skin.name}
            </S.Item>
          ))}
        </S.List>
      </S.Inner>
    </S.Sidebar>
  );
};
