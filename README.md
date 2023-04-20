# Maps Launcher Example
This application demonstrates how to launch Google Maps and Apple maps in multiple ways. You can launch the apps to show a specific pin, or to show driving directions from the current location to that pin as a destination.

## Prerequisites
1. Sync the platform you want to use
```bash
ionic capacitor sync android
ionic capacitor sync ios
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
</plist
```