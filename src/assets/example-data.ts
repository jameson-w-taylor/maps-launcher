import {
  LaunchCurrentNavigationConfig,
  LaunchFullNavigationConfig,
  LaunchWithPinConfig,
  LaunchWithQueryConfig,
  TransportationMode,
} from '@app-launcher/maps/models';

export type LaunchType = 'pin' | 'query' | 'navFromCurrent' | 'fullNav';

interface Example<T> {
  type: LaunchType;
  title: string;
  description: string;
  data: T;
}
type MapWithPin = Pick<LaunchWithPinConfig, 'pinLabel' | 'coordinates'>;
type MapWithQuery = Pick<LaunchWithQueryConfig, 'query' | 'zoomLevel' | 'center'>;
type NavFromCurrent = Pick<LaunchCurrentNavigationConfig, 'mode' | 'destination'>;
type FullNav = Pick<LaunchFullNavigationConfig, 'mode' | 'origin' | 'destination'>;

export const pinExample: Example<MapWithPin> = {
  type: 'pin',
  title: 'Pin by Coordinates',
  description: 'Launch external map application to display a pin using lat/long coordinates.',
  data: {
    pinLabel: 'My Test Pin',
    coordinates: {
      lat: 47.59516499493832,
      long: -122.33208270188918,
    },
  },
};
export const queryExample: Example<MapWithQuery> = {
  type: 'query',
  title: 'Search for "Pizza" Near Coordinates',
  description:
    'Launch external map application to query for "Pizza" around a specific position using lat/long coordinates.',
  data: {
    query: 'Pizza',
    zoomLevel: 17,
    center: {
      lat: 40.75069953659433,
      long: -73.99344943129611,
    },
  },
};
export const navFromCurrentExample: Example<NavFromCurrent> = {
  type: 'navFromCurrent',
  title: 'Navigation to Coordinates',
  description:
    'Launch external map application to display navigation to a specific position from current device location, using lat/long coordinates.',
  data: {
    mode: TransportationMode.Drive,
    destination: {
      lat: 37.33478879168252,
      long: -122.00893981605495,
    },
  },
};
export const fullNavExample: Example<FullNav> = {
  type: 'fullNav',
  title: 'Full Navigation by Address',
  description: 'Launch external map application to display navigation from/to specific locations, using addresses.',
  data: {
    mode: TransportationMode.Transit,
    origin: 'Cloud Gate',
    destination: 'Shedd Aquarium',
  },
};
