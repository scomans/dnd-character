import { Component, effect, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClickOutside } from 'ngxtension/click-outside';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { IftaLabelModule } from 'primeng/iftalabel';
import { ImageModule } from 'primeng/image';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { TreeSelectModule } from 'primeng/treeselect';
import { ALIGNMENTS, DND_BACKGROUNDS, DND_CLASS_TREE, DND_RACES } from '../../models/character.model';
import { CharacterService } from '../../services/character.service';


@Component({
  selector: 'app-header',
  imports: [
    FormsModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    AutoCompleteModule,
    TreeSelectModule,
    TooltipModule,
    IftaLabelModule,
    ImageModule,
    ClickOutside,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  cs = inject(CharacterService);
  alignments = ALIGNMENTS;
  classTree = DND_CLASS_TREE;
  editingName = signal(false);
  editingField = signal<string | null>(null);

  allRaces = DND_RACES;
  allBackgrounds = DND_BACKGROUNDS;
  filteredRaces: string[] = [];
  filteredBackgrounds: string[] = [];

  selectedClassNode = model<any | null>(null);

  constructor() {
    // Keep selectedClassNode in sync with the character signal
    effect(() => {
      const className = this.cs.character().className;
      const classNode = className ? this.findClassNodeByName(className, this.classTree) : null;
      this.selectedClassNode.set(classNode || null);
    });
  }

  findClassNodeByName(name: string, nodes: any[]): any | null {
    for (const node of nodes) {
      if (node.data === name) {
        return node;
      }
      if (node.children) {
        const found = this.findClassNodeByName(name, node.children);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  getAlignmentLabel(): string {
    const value = this.cs.character().alignment;
    return this.alignments.find(a => a.value === value)?.label ?? value;
  }

  onClassNodeSelect(nodeKey: any): void {
    this.selectedClassNode.set(nodeKey);
    if (nodeKey?.data && typeof nodeKey.data === 'string') {
      this.cs.update({ className: nodeKey.data });
    } else {
      this.cs.update({ className: '' });
    }
  }

  onAlignmentChange(value: string): void {
    this.cs.update({ alignment: value });
    this.editingField.set(null);
  }

  filterRaces(event: { query: string }): void {
    const query = event.query.toLowerCase();
    this.filteredRaces = this.allRaces.filter(r => r.toLowerCase().includes(query));
  }

  filterBackgrounds(event: { query: string }): void {
    const query = event.query.toLowerCase();
    this.filteredBackgrounds = this.allBackgrounds.filter(b => b.toLowerCase().includes(query));
  }
}
