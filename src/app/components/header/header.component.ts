import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../services/character.service';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, InputNumberModule],
  template: `
    <div class="header-section">
      <div class="header-title">
        <img src="dnd-logo.svg" alt="D&D" class="dnd-logo" />
        <span class="title-text">Charakterbogen</span>
      </div>
      <div class="header-grid">
        <div class="field name-field">
          <input
            pInputText
            [ngModel]="cs.character().characterName"
            (ngModelChange)="cs.update({ characterName: $event })"
            placeholder="Charaktername"
            class="w-full name-input"
          />
          <label>CHARAKTERNAME</label>
        </div>
        <div class="header-right-grid">
          <div class="field">
            <input
              pInputText
              [ngModel]="cs.character().classAndLevel"
              (ngModelChange)="cs.update({ classAndLevel: $event })"
              class="w-full"
            />
            <label>KLASSEN & STUFEN</label>
          </div>
          <div class="field">
            <input
              pInputText
              [ngModel]="cs.character().playerName"
              (ngModelChange)="cs.update({ playerName: $event })"
              class="w-full"
            />
            <label>SPIELER*IN NAME</label>
          </div>
          <div class="field">
            <input
              pInputText
              [ngModel]="cs.character().background"
              (ngModelChange)="cs.update({ background: $event })"
              class="w-full"
            />
            <label>HINTERGRUND</label>
          </div>
          <div class="field">
            <input
              pInputText
              [ngModel]="cs.character().race"
              (ngModelChange)="cs.update({ race: $event })"
              class="w-full"
            />
            <label>VOLK</label>
          </div>
          <div class="field">
            <p-inputnumber
              [ngModel]="cs.character().experiencePoints"
              (ngModelChange)="cs.update({ experiencePoints: $event ?? 0 })"
              [useGrouping]="false"
              class="w-full"
            />
            <label>ERFAHRUNGSPUNKTE</label>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .header-section {
        background: var(--p-surface-card);
        border: 2px solid var(--p-surface-border);
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1rem;
      }
      .header-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }
      .dnd-logo {
        height: 32px;
      }
      .title-text {
        font-size: 1.2rem;
        font-weight: bold;
        color: var(--p-text-color);
      }
      .header-grid {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 1rem;
        align-items: start;
      }
      .header-right-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 0.5rem;
      }
      .header-right-grid .field:nth-child(4) {
        grid-column: 1;
      }
      .field {
        display: flex;
        flex-direction: column;
      }
      .field label {
        font-size: 0.65rem;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--p-text-muted-color);
        margin-top: 2px;
        text-align: center;
      }
      .name-input {
        font-size: 1.4rem;
        font-weight: bold;
      }
      .name-field {
        align-self: center;
      }
      :host ::ng-deep .p-inputnumber {
        width: 100%;
      }
      :host ::ng-deep .p-inputnumber-input {
        width: 100%;
      }
    `,
  ],
})
export class HeaderComponent {
  cs = inject(CharacterService);
}
