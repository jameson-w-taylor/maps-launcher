import { Component } from '@angular/core';
import { ActionSheetButton, ActionSheetController, IonicModule, Platform } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { MapsService } from '@app/app-launcher';
import { AvailableMapProvider } from '@app-launcher/maps/models';
import { pinExample, queryExample, navFromCurrentExample, fullNavExample, LaunchType } from '@assets/example-data';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class HomePage {
  launchExamples = [pinExample, queryExample, navFromCurrentExample, fullNavExample];

  constructor(
    private platform: Platform,
    private actionSheetCtrl: ActionSheetController,
    private mapsLauncher: MapsService
  ) {}

  async launchMap(type: LaunchType) {
    // Prefer native apps for navigation examples when possible
    const requireNative = this.platform.is('hybrid') && (type === 'navFromCurrent' || type === 'fullNav');
    const availableMaps = await this.mapsLauncher.getAvailable(requireNative ? 'native' : 'web');
    // Sort alphabetically
    availableMaps.sort((a, b) => a.label.localeCompare(b.label));
    const buttons = this.getLaunchButtons(type, availableMaps);
    buttons.push({ text: 'Cancel', role: 'cancel' });
    const actionSheet = await this.actionSheetCtrl.create({ buttons, header: 'Launch Map' });
    await actionSheet.present();
  }

  private getLaunchButtons(type: LaunchType, availableMaps: AvailableMapProvider[]): ActionSheetButton[] {
    return availableMaps.map((map) => {
      const { label: text, provider, launchTarget } = map;

      let handler: ActionSheetButton['handler'];
      switch (type) {
        case 'pin': {
          const { data } = pinExample;
          handler = () => {
            return this.mapsLauncher.launchWithPin(provider, { launchTarget, ...data });
          };
          break;
        }

        case 'query': {
          const { data } = queryExample;
          handler = () => {
            return this.mapsLauncher.launchWithQuery(provider, { launchTarget, ...data });
          };
          break;
        }

        case 'navFromCurrent': {
          const { data } = navFromCurrentExample;
          handler = () => {
            return this.mapsLauncher.launchCurrentNavigation(provider, { launchTarget, ...data });
          };
          break;
        }

        case 'fullNav': {
          const { data } = fullNavExample;
          handler = () => {
            return this.mapsLauncher.launchFullNavigation(provider, { launchTarget, ...data });
          };
          break;
        }
      }

      return { text, handler };
    });
  }
}
