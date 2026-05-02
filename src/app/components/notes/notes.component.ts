import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  SecurityContext,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import { faBars, faEye, faPencil, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Marked } from 'marked';
import { ConfirmationService, MenuItem, TreeNode } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ContextMenu } from 'primeng/contextmenu';
import { Drawer } from 'primeng/drawer';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Tooltip } from 'primeng/tooltip';
import { Tree } from 'primeng/tree';
import { NoteNode } from '../../models/character.model';
import { CharacterService } from '../../services/character.service';
import { markedAccordionExtension } from '../../utils/marked-accordion-extension';
import { markedPlaceholderExtension } from '../../utils/placeholder-replacer';
import { Ripple } from 'primeng/ripple';
import { ClickOutside } from 'ngxtension/click-outside';

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
    if (node.id === id) {
      return node;
    }
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/** Find parent array & index for a node */
function findParent(nodes: NoteNode[], id: string): { parent: NoteNode[]; index: number } | null {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) {
      return { parent: nodes, index: i };
    }
    if (nodes[i].children) {
      const found = findParent(nodes[i].children, id);
      if (found) {
        return found;
      }
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
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Drawer,
    FaIconComponent,
    Button,
    ConfirmDialog,
    ContextMenu,
    FormsModule,
    InputText,
    NgTemplateOutlet,
    Textarea,
    Tooltip,
    Tree,
    Ripple,
    ClickOutside,
  ],
  providers: [ConfirmationService],
})
export class NotesComponent {
  protected readonly farFileEdit = faFile;
  protected readonly fasBars = faBars;
  protected readonly fasEye = faEye;
  protected readonly fasPencil = faPencil;
  protected readonly fasPlus = faPlus;
  protected readonly fasTrash = faTrash;

  private cs = inject(CharacterService);
  private sanitizer = inject(DomSanitizer);
  private confirmationService = inject(ConfirmationService);
  private marked = new Marked(markedAccordionExtension(), markedPlaceholderExtension(this.cs));

  selectedTreeNode: TreeNode | null = null;
  editingContent = signal(false);
  selectedNote = signal<NoteNode | null>(null);
  renamingNote = signal(false);
  sidebarVisible = signal(false);
  renameValue = '';

  contextMenuItems: MenuItem[] = [
    {
      label: 'Unternotiz hinzufügen',
      faIcon: faPlus,
      command: () => this.addChildNote(),
    },
    {
      label: 'Umbenennen',
      faIcon: faPencil,
      command: () => this.startRename(),
    },
    {
      label: 'Löschen',
      faIcon: faTrash,
      command: () => this.confirmDeleteSelectedNote(),
    },
  ];

  treeNodes = computed(() => {
    const notes = this.cs.character().notes ?? [];
    return toTreeNodes(notes);
  });

  renderedHtml = computed(() => {
    const note = this.selectedNote();
    if (!note?.content) {
      return '';
    }
    const content = note.content.replace(/\n(?=\n)/g, '\n\n<br/>\n');
    const html = this.marked.parse(content, { async: false, gfm: true, breaks: true }) as string;
    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, html) || '';
    return this.sanitizer.bypassSecurityTrustHtml(sanitized);
  });

  onNodeSelect(node: TreeNode | TreeNode[] | null | undefined): void {
    if (!node || Array.isArray(node)) {
      return;
    }
    const noteData = node.data as NoteNode;
    this.selectedNote.set(noteData);
    this.renamingNote.set(false);
    this.sidebarVisible.set(false);
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
    if (!selected) {
      return;
    }
    this.addChildNoteById(selected.id);
  }

  addChildNoteById(parentId: string): void {
    const notes = cloneNotes(this.cs.character().notes ?? []);
    const parent = findNode(notes, parentId);
    if (!parent) {
      return;
    }
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
    if (!selected) {
      return;
    }
    this.confirmationService.confirm({
      message: `„${selected.label || 'Unbenannt'}" wirklich löschen?`,
      header: 'Notiz löschen',
      acceptLabel: 'Löschen',
      rejectLabel: 'Abbrechen',
      accept: () => this.deleteSelectedNote(),
    });
  }

  deleteSelectedNote(): void {
    const selected = this.selectedNote();
    if (!selected) {
      return;
    }
    const notes = cloneNotes(this.cs.character().notes ?? []);
    const result = findParent(notes, selected.id);
    if (!result) {
      return;
    }
    result.parent.splice(result.index, 1);
    this.cs.updateNested('notes', notes);
    this.selectedNote.set(null);
    this.selectedTreeNode = null;
  }

  startRename(): void {
    const selected = this.selectedNote();
    if (!selected) {
      return;
    }
    this.renameValue = selected.label;
    this.renamingNote.set(true);
  }

  confirmRename(): void {
    const selected = this.selectedNote();
    if (!selected || !this.renamingNote()) {
      return;
    }
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
    if (!selected) {
      return;
    }
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
    }
  }
}
