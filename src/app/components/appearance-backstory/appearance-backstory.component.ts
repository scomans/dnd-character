import { ChangeDetectionStrategy, Component, effect, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoComplete } from 'primeng/autocomplete';
import { Fieldset } from 'primeng/fieldset';
import { IftaLabel } from 'primeng/iftalabel';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TreeSelect } from 'primeng/treeselect';
import {
  ALIGNMENTS,
  DND_BACKGROUNDS,
  DND_CLASS_TREE,
  DND_RACES,
} from '../../models/character.model';
import { CharacterService } from '../../services/character.service';
import { ImagePickerComponent } from '../image-picker/image-picker.component';
import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';

@Component({
  selector: 'app-appearance-backstory',
  templateUrl: './appearance-backstory.component.html',
  styleUrl: './appearance-backstory.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    InputText,
    Select,
    AutoComplete,
    TreeSelect,
    Fieldset,
    IftaLabel,
    MarkdownEditorComponent,
    ImagePickerComponent,
    InputNumber,
  ],
})
export class AppearanceBackstoryComponent {
  cs = inject(CharacterService);

  alignments = ALIGNMENTS;
  classTree = DND_CLASS_TREE;
  allRaces = DND_RACES;
  allBackgrounds = DND_BACKGROUNDS;
  filteredRaces: string[] = [];
  filteredBackgrounds: string[] = [];
  editingField = signal<string | null>(null);
  selectedClassNode = model<any | null>(null);

  sizeCategories = [
    { value: '', label: 'Keine' },
    { value: 'Winzig', label: 'Winzig' },
    { value: 'Klein', label: 'Klein' },
    { value: 'Mittelgroß', label: 'Mittelgroß' },
    { value: 'Groß', label: 'Groß (Large)' },
    { value: 'Riesig', label: 'Riesig' },
    { value: 'Gigantisch', label: 'Gigantisch' },
  ];

  constructor() {
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
    return this.alignments.find((a) => a.value === value)?.label ?? value;
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
    this.filteredRaces = this.allRaces.filter((r) => r.toLowerCase().includes(query));
  }

  filterBackgrounds(event: { query: string }): void {
    const query = event.query.toLowerCase();
    this.filteredBackgrounds = this.allBackgrounds.filter((b) => b.toLowerCase().includes(query));
  }
}
