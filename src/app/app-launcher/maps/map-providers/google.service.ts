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
 * iOS Documentation: https://developers.google.com/maps/documentation/urls/ios-urlscheme
 * Android Documentation: https://developers.google.com/maps/documentation/urls/android-intents
 * Web Documentation: https://developers.google.com/maps/documentation/urls/get-started
 *                    The Web documentation seems to be somewhat outdated, as desktop Google Maps is using new URL formats
 *                    In this implementation, the new formats are used instead of following the documentation (https://stackoverflow.com/a/47036373)
 *
 * NOTE: Google recommends using their universal links for the web over using native directly
 *       Unless you require functionality that only native apps provide, such as turn-by-turn directions
 *
 *       Also, there doesn't seem to be a way to set a pin label on the web or for iOS.
 *       In addition to that, the implementation for Android seemed to be broken for many years and was fixed semi-recently
 *       https://stackoverflow.com/questions/57281897/add-label-to-google-universal-maps-url-link
 *       https://stackoverflow.com/questions/48623954/google-map-ios-schema-url-show-address-with-name-and-coordinates
 *       https://issuetracker.google.com/issues/129726279
 */

@Injectable({
  providedIn: 'root',
})
export class GoogleService implements MapProvider {
  label = 'Google Maps';

  constructor(private platform: Platform) {}

  async canOpen() {
    const result = { native: false, web: true };

    if (this.platform.is('hybrid')) {
      const url = this.platform.is('ios') ? 'comgooglemaps://' : 'com.google.android.apps.maps';
      const { value } = await AppLauncher.canOpenUrl({ url });
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

    if (launchTarget === 'web') {
      // NOTE: When targeting the web, the app (if installed) will open instead (though this breaks the label ability on Android)
      const desktopStyleURL = new URL(
        `https://www.google.com/maps/search/${coordinates}/@${coordinates},${zoomLevel}z`
      );
      return AppLauncher.openUrl({ url: desktopStyleURL.href });
    } else {
      if (this.platform.is('ios')) {
        const iosURL = new URL('comgooglemaps://');
        iosURL.searchParams.set('q', coordinates);
        iosURL.searchParams.set('zoom', `${zoomLevel}`);
        iosURL.searchParams.set('center', coordinates);
        return AppLauncher.openUrl({ url: iosURL.href });
      }

      /**
       * NOTE: Pin label verified working on Android 12, using Google Maps v11.75.0302 (YMMV for older devices/versions)
       *       Docs offer differing instructions on how to add a label (both seem to work): q=YourLabel@{lat},{long}  -or-  q={lat},{long}(YourLabel)
       *
       *       https://developers.google.com/maps/documentation/urls/android-intents#search-for-a-location
       *       https://developers.google.com/maps/documentation/urls/android-intents#location-search
       */
      const androidURL = new URL(`geo:${coordinates}`);
      androidURL.searchParams.set('q', `${coordinates}(${pinLabel})`);
      androidURL.searchParams.set('z', `${zoomLevel}`);
      return AppLauncher.openUrl({ url: androidURL.href });
    }
  }

  async launchWithQuery(config: LaunchWithQueryConfig) {
    const {
      query,
      zoomLevel = 16,
      launchTarget,
      center: { lat, long },
    } = config;
    const coordinates = `${lat},${long}`;

    if (launchTarget === 'web') {
      const desktopStyleURL = new URL(`https://www.google.com/maps/search/${query}/@${coordinates},${zoomLevel}z/`);
      return AppLauncher.openUrl({ url: desktopStyleURL.href });
    } else {
      if (this.platform.is('ios')) {
        const iosURL = new URL('comgooglemaps://');
        iosURL.searchParams.set('q', query);
        iosURL.searchParams.set('zoom', `${zoomLevel}`);
        iosURL.searchParams.set('center', coordinates);
        return AppLauncher.openUrl({ url: iosURL.href });
      }

      const androidURL = new URL(`geo:${coordinates}`);
      androidURL.searchParams.set('q', query);
      androidURL.searchParams.set('z', `${zoomLevel}`);
      return AppLauncher.openUrl({ url: androidURL.href });
    }
  }

  async launchCurrentNavigation(config: LaunchCurrentNavigationConfig) {
    const {
      mode,
      launchTarget,
      destination: { lat, long },
    } = config;
    const coordinates = `${lat},${long}`;

    if (launchTarget === 'web' || this.platform.is('android')) {
      // NOTE: We need to use the older, actually documented web URLs to accomplish what we want for this feature
      //       If we _were_ to use the native URL scheme, the Android intent has a few limitations:
      //         - Can't start directions immediately on launch (doesn't work on iOS at all)
      //         - Transit mode is *not* supported
      //       So instead of targeting native specifically, we workaround this by using the universal URL instead (opens app anyways if installed)
      const universalURL = new URL(`https://www.google.com/maps/dir/?api=1`);
      universalURL.searchParams.set('destination', coordinates);
      universalURL.searchParams.set('travelmode', this.getTransportMode(mode));
      universalURL.searchParams.set('dir_action', 'navigate');
      return AppLauncher.openUrl({ url: universalURL.href });
    } else {
      const iosURL = new URL('comgooglemaps://');
      iosURL.searchParams.set('daddr', coordinates);
      iosURL.searchParams.set('directionsmode', this.getTransportMode(mode));
      return AppLauncher.openUrl({ url: iosURL.href });
    }
  }

  async launchFullNavigation(config: LaunchFullNavigationConfig) {
    const { mode, launchTarget, origin, destination } = config;

    if (launchTarget === 'web' || this.platform.is('android')) {
      // NOTE: We need to use the older, actually documented web URLs to accomplish what we want for this feature
      //       If we _were_ to use the native URL scheme, the Android intent has a few limitations:
      //         - Can't start directions immediately on launch (doesn't work on iOS at all)
      //         - Transit mode is *not* supported
      //       So instead of targeting native specifically, we workaround this by using the universal URL instead (opens app anyways if installed)
      const universalURL = new URL(`https://www.google.com/maps/dir/?api=1`);
      universalURL.searchParams.set('origin', origin);
      universalURL.searchParams.set('destination', destination);
      universalURL.searchParams.set('travelmode', this.getTransportMode(mode));
      universalURL.searchParams.set('dir_action', 'navigate');
      return AppLauncher.openUrl({ url: universalURL.href });
    } else {
      const iosURL = new URL('comgooglemaps://');
      iosURL.searchParams.set('saddr', origin);
      iosURL.searchParams.set('daddr', destination);
      iosURL.searchParams.set('directionsmode', this.getTransportMode(mode));
      return AppLauncher.openUrl({ url: iosURL.href });
    }
  }

  private getTransportMode(mode: TransportationMode, useAndroidValues: boolean = false) {
    switch (mode) {
      case TransportationMode.Transit: {
        // NOTE: Android intent for native URL scheme does *not* support Transit mode
        return useAndroidValues ? '' : 'transit';
      }
      case TransportationMode.Drive: {
        return useAndroidValues ? 'd' : 'driving';
      }
      case TransportationMode.Walk: {
        return useAndroidValues ? 'w' : 'walking';
      }
    }
  }
}
