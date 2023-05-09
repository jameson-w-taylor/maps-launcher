# Maps Launcher Example

This application demonstrates how to launch Apple and Google Maps in multiple ways. You can launch these apps to view:

- A specific pin using lat/long coordinates
- Search results for something in a specific area using lat/long coordinates
- Driving navigation from the current location to a lat/long coordinate
- Public transit directions to a specific location, from a specific location, using addresses

## Prerequisites

1. Build and add the platform you want to use

```bash
ionic build
ionic capacitor add android
ionic capacitor add ios
```

2. Add the required native configurations

- For android, you'll need to modify `android/app/src/main/AndroidManifest.xml`

```xml
<manifest>
  ...

  <queries>
    <package android:name="com.google.android.apps.maps" />
    <intent>
      <action android:name="android.intent.action.ACTION_VIEW" />
    </intent>
  </queries>
</manifest>
```

- For iOS, you'll need to add this entry to `ios/App/App/Info.plist`

```xml
<plist>
<dict>
  ...

  <key>LSApplicationQueriesSchemes</key>
  <array>
    <string>maps</string>
    <string>comgooglemaps</string>
  </array>
</dict>
</plist>
```

## Architecture

This application attempts to model the architecture you might use in a real-world scenario:

```
app-launcher/
  maps/
    maps.service.ts
    map-providers/
      apple.service.ts
      google.service.ts
```

You'll see there is a feature folder, which might container other kinds of external application integrations (for now, only maps). Within that there is a `MapsService` which provides a consistent API to launch an external map application features common across all the supported external apps. Finally there are separate services specific to each support map application, which implement the needed functionality to integrate with the associated app.

Each of the low-level services are responsible for integrating with the external application, and you'll find helpful comments and links to documentation there.
