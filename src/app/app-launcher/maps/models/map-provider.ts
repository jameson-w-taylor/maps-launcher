import { OpenURLResult } from '@capacitor/app-launcher';

export type SupportedMapApplication = 'AppleMaps' | 'GoogleMaps';

export type LaunchTarget = 'web' | 'native';

export enum TransportationMode {
  Walk = 'Walk',
  Drive = 'Drive',
  Transit = 'Public Transit',
}

export interface MapProvider {
  label: string;
  canOpen: () => Promise<CanOpenResult>;
  launchWithPin: (config: LaunchWithPinConfig) => Promise<OpenURLResult>;
  launchWithQuery: (config: LaunchWithQueryConfig) => Promise<OpenURLResult>;
  launchCurrentNavigation: (config: LaunchCurrentNavigationConfig) => Promise<OpenURLResult>;
  launchFullNavigation: (config: LaunchFullNavigationConfig) => Promise<OpenURLResult>;
}

export interface MapProviderStatus {
  canOpen: CanOpenResult;
  provider: SupportedMapApplication;
  label: string;
}

export interface AvailableMapProvider {
  launchTarget: LaunchTarget;
  provider: SupportedMapApplication;
  label: string;
}

export interface CanOpenResult {
  native: boolean;
  web: boolean;
}

export interface LaunchWithPinConfig extends BaseLaunchConfig {
  pinLabel: string;
  coordinates: {
    lat: number;
    long: number;
  };
}

export interface LaunchWithQueryConfig extends BaseLaunchConfig {
  query: string;
  center: {
    lat: number;
    long: number;
  };
}

export interface LaunchCurrentNavigationConfig extends BaseLaunchConfig {
  mode: TransportationMode;
  destination: {
    lat: number;
    long: number;
  };
}

export interface LaunchFullNavigationConfig extends BaseLaunchConfig {
  mode: TransportationMode;
  origin: string;
  destination: string;
}

interface BaseLaunchConfig {
  launchTarget: LaunchTarget;
  zoomLevel?: number;
}
