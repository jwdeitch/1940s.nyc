// import canUseWebP from 'utils/canUseWebP';

const LAYER_IDS = [
  'arial-1924',
  'arial-1951',
  'district-1937',
  'atlas-1916',
  'atlas-1930',
  'atlas-1956',
  'nyc-label',
] as const;

type LayerId = typeof LAYER_IDS[number];
export type OverlayId =
  | 'default-map'
  | 'default-arial'
  | 'arial-1924'
  | 'arial-1951'
  | 'district'
  | 'atlas-1916'
  | 'atlas-1930'
  | 'atlas-1956';

// For tiles recompressed at edge
// const ext = canUseWebP() ? 'webp' : 'png';

// Overlays are collections of layers
const overlaysToLayers: { [overlay in OverlayId]: LayerId[] } = {
  get 'default-map'() {
    return this['atlas-1930'];
  },
  get 'default-arial'() {
    return [...this['default-map'], ...this['arial-1951']];
  },
  'arial-1924': ['arial-1924', 'nyc-label'],
  'arial-1951': ['arial-1951', 'nyc-label'],
  district: ['district-1937', 'nyc-label'],
  'atlas-1916': ['atlas-1916'],
  'atlas-1930': ['atlas-1930'],
  'atlas-1956': ['atlas-1956'],
};

const NYC_ATTRIBUTION =
  '© City of New York <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank">CC BY 4.0</a>';

const NYPL_ATTRIBUTION =
  'The Lionel Pincus & Princess Firyal Map Division, NYPL';

const MANHATTAN = [
  -74.04772962763064, 40.68291694544512, -73.90665099539478, 40.87903804730722,
];

export const installLayers = (map: mapboxgl.Map, photoLayer: string): void => {
  [
    {
      url: 'https://nypl-tiles.1940s.nyc/1067/{z}/{x}/{y}.png',
      targetId: 'district-1937',
      attribution: '[1937] ' + NYPL_ATTRIBUTION,
    },
    {
      url: 'https://nypl-tiles.1940s.nyc/862/{z}/{x}/{y}.png',
      targetId: 'atlas-1916',
      attribution: '[1916] ' + NYPL_ATTRIBUTION,
      bounds: MANHATTAN,
    },
    {
      url: 'https://mapwarper.net/mosaics/tile/1194/{z}/{x}/{y}.png',
      targetId: 'atlas-1930',
      attribution: '[1930] ' + NYPL_ATTRIBUTION,
      bounds: MANHATTAN,
    },
    {
      url: 'https://nypl-tiles.1940s.nyc/1453/{z}/{x}/{y}.png',
      targetId: 'atlas-1956',
      attribution: '[1956] ' + NYPL_ATTRIBUTION,
      bounds: MANHATTAN,
    },
    {
      url: 'https://maps.nyc.gov/xyz/1.0.0/photo/1924/{z}/{x}/{y}.png8',
      targetId: 'arial-1924',
      attribution: '[1924] ' + NYC_ATTRIBUTION,
    },
    {
      url: 'https://maps.nyc.gov/xyz/1.0.0/photo/1951/{z}/{x}/{y}.png8',
      targetId: 'arial-1951',
      attribution: '[1951] ' + NYC_ATTRIBUTION,
    },
    {
      url: 'https://maps.nyc.gov/xyz/1.0.0/carto/label-lt/{z}/{x}/{y}.png8',
      targetId: 'nyc-label',
      attribution: NYC_ATTRIBUTION,
    },
  ].forEach((mapSpec) => {
    map.addSource(mapSpec.targetId, {
      type: 'raster',
      tiles: [mapSpec.url],
      attribution: mapSpec.attribution,
      tileSize: 256,
      ...(mapSpec.bounds ? { bounds: mapSpec.bounds } : {}),
    });

    map.addLayer(
      {
        id: mapSpec.targetId,
        source: mapSpec.targetId,
        type: 'raster',
        layout: {
          visibility: 'none',
        },
      },
      photoLayer
    );
  });

  map.setLayerZoomRange('atlas-1930', 14, 24);
  map.setPaintProperty('atlas-1930', 'raster-opacity', [
    'interpolate',
    ['linear'],
    ['zoom'],
    14,
    0,
    15,
    0.1,
    17,
    1,
  ]);
};

export const setOverlay = (
  map: mapboxgl.Map,
  overlayId: OverlayId | null
): void => {
  const visibleLayers = overlayId ? overlaysToLayers[overlayId] : [];
  LAYER_IDS.forEach((layerId) => {
    map.setLayoutProperty(
      layerId,
      'visibility',
      visibleLayers.includes(layerId) ? 'visible' : 'none'
    );
  });
};
