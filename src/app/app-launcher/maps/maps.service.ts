import { Injectable } from '@angular/core';
import {
  MapProvider,
  LaunchWithPinConfig,
  SupportedMapApplication,
  LaunchTarget,
  AvailableMapProvider,
  LaunchWithQueryConfig,
  LaunchCurrentNavigationConfig,
  LaunchFullNavigationConfig,
  MapProviderStatus,
} from '@app-launcher/maps/models';
import { GoogleService } from './map-providers/google.service';
import { AppleService } from './map-providers/apple.service';
import { App } from '@capacitor/app';

type PossibleMapProviders = Record<SupportedMapApplication, MapProvider>;

@Injectable({
  providedIn: 'root',
})
export class MapsService {
  private providerStatus: Promise<MapProviderStatus[]>;
  private mapProviders: PossibleMapProviders = {
    GoogleMaps: this.google,
    AppleMaps: this.apple,
  };

  constructor(private google: GoogleService, private apple: AppleService) {
    this.providerStatus = this.getProviders();
    App.addListener('resume', () => {
      // Recheck map providers on app resume in case user installed new app
      this.providerStatus = this.getProviders();
    });
  }

  async getAvailable(launchTarget: LaunchTarget = 'web') {
    const providers = await this.providerStatus;

    return providers.reduce((available, provider) => {
      const { canOpen, ...rest } = provider;
      const isAvailable = launchTarget === 'native' ? canOpen.native : canOpen.web;

      if (isAvailable) {
        available.push({ launchTarget, ...rest });
      }
      return available;
    }, [] as AvailableMapProvider[]);
  }

  async launchWithPin(provider: keyof PossibleMapProviders, config: LaunchWithPinConfig) {
    const map = this.mapProviders[provider];
    try {
      const { completed } = await map.launchWithPin(config);
      if (!completed) {
        throw new Error(`Failed to open ${map.label}!`);
      }
    } catch (e) {
      console.error((e as Error).message);
    }
  }

  async launchWithQuery(provider: keyof PossibleMapProviders, config: LaunchWithQueryConfig) {
    const map = this.mapProviders[provider];
    try {
      const { completed } = await map.launchWithQuery(config);
      if (!completed) {
        throw new Error(`Failed to open ${map.label}!`);
      }
    } catch (e) {
      console.error((e as Error).message);
    }
  }

  async launchCurrentNavigation(provider: keyof PossibleMapProviders, config: LaunchCurrentNavigationConfig) {
    const map = this.mapProviders[provider];
    try {
      const { completed } = await map.launchCurrentNavigation(config);
      if (!completed) {
        throw new Error(`Failed to open ${map.label}!`);
      }
    } catch (e) {
      console.error((e as Error).message);
    }
  }

  async launchFullNavigation(provider: keyof PossibleMapProviders, config: LaunchFullNavigationConfig) {
    const map = this.mapProviders[provider];
    try {
      const { completed } = await map.launchFullNavigation(config);
      if (!completed) {
        throw new Error(`Failed to open ${map.label}!`);
      }
    } catch (e) {
      console.error((e as Error).message);
    }
  }

  private async getProviders() {
    const results = [];

    for (const provider in this.mapProviders) {
      results.push(this.checkAvailability(provider as keyof PossibleMapProviders));
    }

    return Promise.all(results);
  }

  private async checkAvailability(provider: keyof PossibleMapProviders) {
    const map = this.mapProviders[provider];
    let canOpen = { native: false, web: false };

    try {
      canOpen = await map.canOpen();
    } catch (e) {
      console.warn(`Failed to check ${map.label}: `, e);
    } finally {
      return {
        canOpen,
        provider,
        label: map.label,
      };
    }
  }
}
