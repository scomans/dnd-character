import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../services/character.service';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, InputNumberModule, TooltipModule],
  template: `
    <div class="bg-white border-2 border-slate-700 rounded-lg p-4 mb-4">
      <div class="flex items-center gap-2 mb-3">
        <span class="text-2xl font-bold text-slate-800 tracking-wide font-serif">DUNGEONS & DRAGONS</span>
      </div>
      <div class="flex gap-4 items-start">
        @if (cs.character().characterImage) {
          <div class="shrink-0">
            <img [src]="cs.character().characterImage" alt="Charakter" class="w-16 h-16 object-cover rounded-lg border border-gray-300" />
          </div>
        }
        <div class="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4">
          <div class="flex flex-col">
            <input
              pInputText
              [ngModel]="cs.character().characterName"
              (ngModelChange)="cs.update({ characterName: $event })"
              placeholder="Charaktername"
              class="w-full text-xl font-bold"
            />
            <label class="text-[0.65rem] font-bold uppercase text-gray-500 mt-0.5 text-center">CHARAKTERNAME</label>
          </div>
          <div class="grid grid-cols-5 gap-2">
            <div class="flex flex-col">
              <div class="flex gap-1">
                <input pInputText [ngModel]="cs.character().className" (ngModelChange)="cs.update({ className: $event })" class="flex-1 min-w-0" placeholder="Klasse" />
                <p-inputnumber
                  [ngModel]="cs.character().level"
                  (ngModelChange)="cs.update({ level: $event ?? 1 })"
                  [min]="1"
                  [max]="20"
                  [showButtons]="false"
                  [inputStyle]="{ width: '2.5rem', textAlign: 'center', fontSize: '0.85rem' }"
                />
              </div>
              <label class="text-[0.65rem] font-bold uppercase text-gray-500 mt-0.5 text-center">Klasse & Stufe</label>
            </div>
            <div class="flex flex-col">
              <input pInputText [ngModel]="cs.character().background" (ngModelChange)="cs.update({ background: $event })" class="w-full" />
              <label class="text-[0.65rem] font-bold uppercase text-gray-500 mt-0.5 text-center">Hintergrund</label>
            </div>
            <div class="flex flex-col">
              <input pInputText [ngModel]="cs.character().race" (ngModelChange)="cs.update({ race: $event })" class="w-full" />
              <label class="text-[0.65rem] font-bold uppercase text-gray-500 mt-0.5 text-center">Volk</label>
            </div>
            <div class="flex flex-col">
              <input pInputText [ngModel]="cs.character().playerName" (ngModelChange)="cs.update({ playerName: $event })" class="w-full" />
              <label class="text-[0.65rem] font-bold uppercase text-gray-500 mt-0.5 text-center">Spieler*in</label>
            </div>
            <div class="flex flex-col" pTooltip="Erfahrungspunkte" tooltipPosition="top">
              <p-inputnumber
                [ngModel]="cs.character().experiencePoints"
                (ngModelChange)="cs.update({ experiencePoints: $event ?? 0 })"
                [useGrouping]="false"
                [inputStyle]="{ width: '100%' }"
              />
              <label class="text-[0.65rem] font-bold uppercase text-gray-500 mt-0.5 text-center">EP</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class HeaderComponent {
  cs = inject(CharacterService);
}
