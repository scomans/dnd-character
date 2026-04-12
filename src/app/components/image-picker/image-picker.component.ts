import { Component, input, output, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-image-picker',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="flex flex-col items-center gap-2">
      @if (imageData()) {
        <img
          [src]="imageData()"
          [alt]="alt()"
          [class]="imageClass()"
          class="object-cover rounded-lg border border-gray-300 cursor-pointer"
          (click)="openFilePicker()"
        />
        <p-button
          icon="pi pi-trash"
          size="small"
          severity="danger"
          [text]="true"
          (onClick)="removeImage()"
        />
      } @else {
        <div
          class="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-amber-600 hover:bg-amber-50 transition-colors"
          [class]="placeholderClass()"
          (click)="openFilePicker()"
        >
          <i class="pi pi-image text-2xl text-gray-400 mb-1"></i>
          <span class="text-xs text-gray-500">{{ placeholder() }}</span>
        </div>
      }
      <input
        #fileInput
        type="file"
        accept="image/*"
        class="hidden"
        (change)="onFileSelected($event)"
      />
    </div>
  `,
})
export class ImagePickerComponent {
  imageData = input<string>('');
  alt = input<string>('Bild');
  placeholder = input<string>('Bild auswählen');
  imageClass = input<string>('w-32 h-32');
  placeholderClass = input<string>('w-32 h-32');
  imageChange = output<string>();

  fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  openFilePicker(): void {
    this.fileInput().nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.imageChange.emit(result);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.imageChange.emit('');
  }
}
