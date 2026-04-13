import { Component, inject, signal, computed, SecurityContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { marked } from 'marked';
import { TreeModule } from 'primeng/tree';
import { TreeNode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ContextMenuModule } from 'primeng/contextmenu';
import { MenuItem } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { CharacterService } from '../../services/character.service';
import { NoteNode } from '../../models/character.model';
import { markedAccordionExtension } from '../../utils/marked-accordion-extension';

marked.use(markedAccordionExtension());

function generateId(): string {
  return `note-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/** Convert NoteNode[] to PrimeNG TreeNode[] */
function toTreeNodes(notes: NoteNode[]): TreeNode[] {
  return notes.map((n) => ({
    key: n.id,
    label: n.label,
    data: n,
    expanded: n.expanded ?? false,
    children: n.children ? toTreeNodes(n.children) : [],
    leaf: !n.children?.length,
  }));
}

/** Find a NoteNode by id within the tree */
function findNode(nodes: NoteNode[], id: string): NoteNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

/** Find parent array & index for a node */
function findParent(
  nodes: NoteNode[],
  id: string,
): { parent: NoteNode[]; index: number } | null {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) return { parent: nodes, index: i };
    if (nodes[i].children) {
      const found = findParent(nodes[i].children, id);
      if (found) return found;
    }
  }
  return null;
}

/** Deep clone notes array */
function cloneNotes(notes: NoteNode[]): NoteNode[] {
  return JSON.parse(JSON.stringify(notes));
}

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TreeModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    ContextMenuModule,
    TooltipModule,
  ],
  template: `
    <div class="flex gap-4 mt-4" style="min-height: 500px;">
      <!-- Left: Tree View -->
      <div
        class="flex flex-col border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 overflow-hidden"
        style="width: 280px; min-width: 220px;"
      >
        <div class="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-750">
          <span class="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Notizen</span>
          <div class="flex gap-1">
            <p-button
              icon="pi pi-plus"
              [rounded]="true"
              [text]="true"
              size="small"
              (onClick)="addRootNote()"
              pTooltip="Neue Notiz"
              tooltipPosition="top"
            />
          </div>
        </div>
        <div class="flex-1 overflow-y-auto p-1">
          @if (treeNodes().length) {
            <p-tree
              [value]="treeNodes()"
              selectionMode="single"
              [(selection)]="selectedTreeNode"
              (selectionChange)="onNodeSelect($event)"
              (onNodeExpand)="onNodeToggle()"
              (onNodeCollapse)="onNodeToggle()"
              [contextMenu]="cm"
              [metaKeySelection]="false"
              class="notes-tree"
            />
          } @else {
            <div class="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm p-4 text-center">
              <i class="pi pi-file-edit text-3xl mb-2"></i>
              <span>Noch keine Notizen.</span>
              <button
                type="button"
                class="mt-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 text-xs cursor-pointer bg-transparent border-none"
                (click)="addRootNote()"
              >Erste Notiz erstellen</button>
            </div>
          }
        </div>
      </div>

      <!-- Right: Editor -->
      <div class="flex-1 flex flex-col border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 overflow-hidden">
        @if (selectedNote()) {
          <!-- Note title bar -->
          <div class="flex items-center gap-2 px-3 py-2 border-b border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-750">
            @if (renamingNote()) {
              <input
                pInputText
                [(ngModel)]="renameValue"
                (keydown.enter)="confirmRename()"
                (keydown.escape)="cancelRename()"
                (blur)="confirmRename()"
                class="text-sm flex-1"
                autofocus
              />
            } @else {
              <span
                class="text-sm font-semibold text-slate-700 dark:text-slate-300 flex-1 cursor-pointer hover:text-blue-600"
                (dblclick)="startRename()"
                pTooltip="Doppelklick zum Umbenennen"
                tooltipPosition="top"
              >{{ selectedNote()!.label }}</span>
            }
            <div class="flex gap-1">
              <p-button
                icon="pi pi-plus"
                [rounded]="true"
                [text]="true"
                size="small"
                (onClick)="addChildNote()"
                pTooltip="Unternotiz hinzufügen"
                tooltipPosition="top"
              />
              <p-button
                icon="pi pi-pencil"
                [rounded]="true"
                [text]="true"
                size="small"
                (onClick)="startRename()"
                pTooltip="Umbenennen"
                tooltipPosition="top"
              />
              <p-button
                icon="pi pi-trash"
                [rounded]="true"
                [text]="true"
                severity="danger"
                size="small"
                (onClick)="deleteSelectedNote()"
                pTooltip="Löschen"
                tooltipPosition="top"
              />
            </div>
          </div>
          <!-- Editor area -->
          <div class="flex-1 flex flex-col overflow-hidden">
            @if (editingContent()) {
              <textarea
                pTextarea
                [autoResize]="false"
                [ngModel]="selectedNote()!.content"
                (ngModelChange)="updateNoteContent($event)"
                class="w-full flex-1 text-sm border-none resize-none p-3"
                style="min-height: 100%; outline: none;"
                placeholder="Markdown-Inhalt hier eingeben..."
              ></textarea>
              <div class="flex justify-end px-3 py-1 border-t border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-750">
                <p-button
                  label="Vorschau"
                  icon="pi pi-eye"
                  [text]="true"
                  size="small"
                  (onClick)="editingContent.set(false)"
                />
              </div>
            } @else {
              <div
                class="flex-1 overflow-y-auto p-3 text-sm leading-relaxed markdown-content cursor-pointer"
                [innerHTML]="renderedHtml()"
                (click)="editingContent.set(true)"
              ></div>
              <div class="flex justify-end px-3 py-1 border-t border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-750">
                <p-button
                  label="Bearbeiten"
                  icon="pi pi-pencil"
                  [text]="true"
                  size="small"
                  (onClick)="editingContent.set(true)"
                />
              </div>
            }
          </div>
        } @else {
          <div class="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
            <i class="pi pi-file-edit text-5xl mb-3"></i>
            <span class="text-sm">Wähle eine Notiz aus oder erstelle eine neue.</span>
          </div>
        }
      </div>
    </div>

    <p-contextmenu #cm [model]="contextMenuItems" />
  `,
  styles: `
    :host ::ng-deep .notes-tree .p-tree {
      border: none;
      padding: 0;
      background: transparent;
    }
    :host ::ng-deep .notes-tree .p-tree-node-content {
      padding: 0.25rem 0.4rem;
      border-radius: 4px;
    }
    :host ::ng-deep .notes-tree .p-tree-node-label {
      font-size: 0.85rem;
    }
  `,
})
export class NotesComponent {
  private cs = inject(CharacterService);
  private sanitizer = inject(DomSanitizer);

  selectedTreeNode: TreeNode | null = null;
  selectedNote = signal<NoteNode | null>(null);
  editingContent = signal(false);
  renamingNote = signal(false);
  renameValue = '';

  contextMenuItems: MenuItem[] = [
    {
      label: 'Unternotiz hinzufügen',
      icon: 'pi pi-plus',
      command: () => this.addChildNote(),
    },
    {
      label: 'Umbenennen',
      icon: 'pi pi-pencil',
      command: () => this.startRename(),
    },
    {
      label: 'Löschen',
      icon: 'pi pi-trash',
      command: () => this.deleteSelectedNote(),
    },
  ];

  treeNodes = computed(() => {
    const notes = this.cs.character().notes ?? [];
    return toTreeNodes(notes);
  });

  renderedHtml = computed(() => {
    const note = this.selectedNote();
    if (!note?.content) return '';
    const html = marked.parse(note.content, { async: false }) as string;
    const sanitized =
      this.sanitizer.sanitize(SecurityContext.HTML, html) || '';
    return this.sanitizer.bypassSecurityTrustHtml(sanitized);
  });

  onNodeSelect(node: TreeNode | TreeNode[] | null | undefined): void {
    if (!node || Array.isArray(node)) return;
    const noteData = node.data as NoteNode;
    this.selectedNote.set(noteData);
    this.editingContent.set(false);
    this.renamingNote.set(false);
  }

  onNodeToggle(): void {
    // Persist expanded state
    const notes = cloneNotes(this.cs.character().notes ?? []);
    this.syncExpandedState(this.treeNodes(), notes);
    this.cs.updateNested('notes', notes);
  }

  private syncExpandedState(treeNodes: TreeNode[], noteNodes: NoteNode[]): void {
    for (const tn of treeNodes) {
      const nn = findNode(noteNodes, tn.key!);
      if (nn) {
        nn.expanded = tn.expanded ?? false;
        if (tn.children?.length) {
          this.syncExpandedState(tn.children, noteNodes);
        }
      }
    }
  }

  addRootNote(): void {
    const notes = cloneNotes(this.cs.character().notes ?? []);
    const newNote: NoteNode = {
      id: generateId(),
      label: 'Neue Notiz',
      content: '',
      children: [],
      expanded: false,
    };
    notes.push(newNote);
    this.cs.updateNested('notes', notes);
    this.selectNodeById(newNote.id);
    this.startRename();
  }

  addChildNote(): void {
    const selected = this.selectedNote();
    if (!selected) return;
    const notes = cloneNotes(this.cs.character().notes ?? []);
    const parent = findNode(notes, selected.id);
    if (!parent) return;
    const newNote: NoteNode = {
      id: generateId(),
      label: 'Neue Unternotiz',
      content: '',
      children: [],
      expanded: false,
    };
    parent.children.push(newNote);
    parent.expanded = true;
    this.cs.updateNested('notes', notes);
    this.selectNodeById(newNote.id);
    this.startRename();
  }

  deleteSelectedNote(): void {
    const selected = this.selectedNote();
    if (!selected) return;
    const notes = cloneNotes(this.cs.character().notes ?? []);
    const result = findParent(notes, selected.id);
    if (!result) return;
    result.parent.splice(result.index, 1);
    this.cs.updateNested('notes', notes);
    this.selectedNote.set(null);
    this.selectedTreeNode = null;
    this.editingContent.set(false);
  }

  startRename(): void {
    const selected = this.selectedNote();
    if (!selected) return;
    this.renameValue = selected.label;
    this.renamingNote.set(true);
  }

  confirmRename(): void {
    const selected = this.selectedNote();
    if (!selected || !this.renamingNote()) return;
    const newLabel = this.renameValue.trim() || selected.label;
    const notes = cloneNotes(this.cs.character().notes ?? []);
    const node = findNode(notes, selected.id);
    if (node) {
      node.label = newLabel;
      this.cs.updateNested('notes', notes);
      this.selectedNote.set(node);
    }
    this.renamingNote.set(false);
  }

  cancelRename(): void {
    this.renamingNote.set(false);
  }

  updateNoteContent(content: string): void {
    const selected = this.selectedNote();
    if (!selected) return;
    const notes = cloneNotes(this.cs.character().notes ?? []);
    const node = findNode(notes, selected.id);
    if (node) {
      node.content = content;
      this.cs.updateNested('notes', notes);
      this.selectedNote.set(node);
    }
  }

  private selectNodeById(id: string): void {
    const notes = this.cs.character().notes ?? [];
    const note = findNode(notes, id);
    if (note) {
      this.selectedNote.set(note);
      this.selectedTreeNode = { key: id, label: note.label, data: note };
      this.editingContent.set(false);
    }
  }
}
