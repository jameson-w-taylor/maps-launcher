import { Injectable } from '@angular/core';
import {
  LaunchCurrentNavigationConfig,
  LaunchFullNavigationConfig,
  LaunchWithPinConfig,
  LaunchWithQueryConfig,
  MapProvider,
  TransportationMode,
} from '@app-launcher/maps/models';
import { AppLauncher } from '@capacitor/app-launcher';
import { Platform } from '@ionic/angular';

/**
 * Documentation: https://developer.apple.com/library/archive/featuredarticles/iPhoneURLScheme_Reference/MapLinks/MapLinks.html
 *
 * NOTE: Apple will _always_ return true for the Apple Maps application check
 *       https://stackoverflow.com/questions/39603120/how-to-check-if-apple-maps-is-installed
 *
 *       Opening using the native URL scheme will result in "completed: false" if the app is not installed
 *       Opening using the web URL (which can only open the native app), will result in "completed: true" if the app is not installed
 *       Since the end result of both approaches can only be opening the native app, it's unclear if it matters which you use...
 *       Just be aware that in code, the openUrl result will differ when the app is not installed
 */

@Injectable({
  providedIn: 'root',
})
export class AppleService implements MapProvider {
  label = 'Apple Maps';

  constructor(private platform: Platform) {}

  async canOpen() {
    const { value: web } = await AppLauncher.canOpenUrl({ url: 'http://maps.apple.com/' });
    const result = { native: false, web };

    if (this.platform.is('ios')) {
      const { value } = await AppLauncher.canOpenUrl({ url: 'maps://' });
      result.native = value;
    }

    return result;
  }

  async launchWithPin(config: LaunchWithPinConfig) {
    const {
      pinLabel,
      zoomLevel = 16,
      launchTarget,
      coordinates: { lat, long },
    } = config;
    const coordinates = `${lat},${long}`;

    if (zoomLevel < 2 || zoomLevel > 21) {
      throw new RangeError(`${this.label} 'zoomLevel' must be between 2 and 21!`);
    }

    const launchUrl = new URL(launchTarget === 'native' ? 'maps://' : 'http://maps.apple.com/');
    // The params 'q' and 'll' must be used together to drop a pin at a specific lat/long
    launchUrl.searchParams.set('q', pinLabel);
    launchUrl.searchParams.set('z', `${zoomLevel}`);
    launchUrl.searchParams.set('ll', coordinates);
    return AppLauncher.openUrl({ url: launchUrl.href });
  }

  async launchWithQuery(config: LaunchWithQueryConfig) {
    const {
      query,
      zoomLevel = 16,
      launchTarget,
      center: { lat, long },
    } = config;
    const coordinates = `${lat},${long}`;

    if (zoomLevel < 2 || zoomLevel > 21) {
      throw new RangeError(`${this.label} 'zoomLevel' must be between 2 and 21!`);
    }

    const launchUrl = new URL(launchTarget === 'native' ? 'maps://' : 'http://maps.apple.com/');
    launchUrl.searchParams.set('q', query);
    launchUrl.searchParams.set('z', `${zoomLevel}`);
    launchUrl.searchParams.set('sll', coordinates);
    return AppLauncher.openUrl({ url: launchUrl.href });
  }

  async launchCurrentNavigation(config: LaunchCurrentNavigationConfig) {
    const {
      mode,
      launchTarget,
      destination: { lat, long },
    } = config;
    const coordinates = `${lat},${long}`;

    const launchUrl = new URL(launchTarget === 'native' ? 'maps://' : 'http://maps.apple.com/');
    launchUrl.searchParams.set('daddr', coordinates);
    launchUrl.searchParams.set('dirflg', this.getTransportType(mode));
    return AppLauncher.openUrl({ url: launchUrl.href });
  }

  async launchFullNavigation(config: LaunchFullNavigationConfig) {
    const { mode, launchTarget, origin, destination } = config;

    const launchUrl = new URL(launchTarget === 'native' ? 'maps://' : 'http://maps.apple.com/');
    launchUrl.searchParams.set('saddr', origin);
    launchUrl.searchParams.set('daddr', destination);
    launchUrl.searchParams.set('dirflg', this.getTransportType(mode));
    return AppLauncher.openUrl({ url: launchUrl.href });
  }

  private getTransportType(mode: TransportationMode) {
    switch (mode) {
      case TransportationMode.Transit: {
        return 'r';
      }
      case TransportationMode.Drive: {
        return 'd';
      }
      case TransportationMode.Walk: {
        return 'w';
      }
    }
  }
}
