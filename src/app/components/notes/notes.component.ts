import { Component, inject, signal, computed, SecurityContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Marked } from 'marked';
import { TreeModule } from 'primeng/tree';
import { TreeNode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ContextMenuModule } from 'primeng/contextmenu';
import { MenuItem, ConfirmationService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { CharacterService } from '../../services/character.service';
import { NoteNode } from '../../models/character.model';
import { markedAccordionExtension } from '../../utils/marked-accordion-extension';
import { markedPlaceholderExtension } from '../../utils/placeholder-replacer';

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
  imports: [
    CommonModule,
    FormsModule,
    TreeModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    ContextMenuModule,
    TooltipModule,
    ConfirmDialog,
  ],
  providers: [ConfirmationService],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.scss',
})
export class NotesComponent {
  private cs = inject(CharacterService);
  private sanitizer = inject(DomSanitizer);
  private confirmationService = inject(ConfirmationService);
  private marked = new Marked(markedAccordionExtension(), markedPlaceholderExtension(this.cs));

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
      command: () => this.confirmDeleteSelectedNote(),
    },
  ];

  treeNodes = computed(() => {
    const notes = this.cs.character().notes ?? [];
    return toTreeNodes(notes);
  });

  renderedHtml = computed(() => {
    const note = this.selectedNote();
    if (!note?.content) return '';
    const html = this.marked.parse(note.content, { async: false }) as string;
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
    this.addChildNoteById(selected.id);
  }

  addChildNoteById(parentId: string): void {
    const notes = cloneNotes(this.cs.character().notes ?? []);
    const parent = findNode(notes, parentId);
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

  confirmDeleteSelectedNote(): void {
    const selected = this.selectedNote();
    if (!selected) return;
    this.confirmationService.confirm({
      message: `„${selected.label || 'Unbenannt'}" wirklich löschen?`,
      header: 'Notiz löschen',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Löschen',
      rejectLabel: 'Abbrechen',
      accept: () => this.deleteSelectedNote(),
    });
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
