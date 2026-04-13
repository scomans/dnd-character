import { Component, input, output, ElementRef, viewChild, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-image-picker',
  standalone: true,
  imports: [ButtonModule],
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
          class="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-slate-500 hover:bg-slate-50 transition-colors"
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
  private ngZone = inject(NgZone);
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
      this.compressImage(file).then((compressedDataUrl) => {
        this.ngZone.run(() => this.imageChange.emit(compressedDataUrl));
      });
      // Reset file input so the same file can be re-selected and change event fires again
      input.value = '';
    }
  }

  /**
   * Compress and resize an image to fit within localStorage limits.
   * Max dimension is 400px, JPEG quality 0.6.
   */
  private compressImage(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxSize = 400;
          let { width, height } = img;
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = Math.round(height * maxSize / width);
              width = maxSize;
            } else {
              width = Math.round(width * maxSize / height);
              height = maxSize;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(): void {
    this.imageChange.emit('');
  }
}
