import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  NgZone,
  output,
  viewChild,
} from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faImage } from '@fortawesome/free-regular-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button } from 'primeng/button';
import { Image as PrimeImage } from 'primeng/image';
import { EditModeService } from '../../services/edit-mode.service';

@Component({
  selector: 'app-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrl: './image-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, PrimeImage, FaIconComponent],
})
export class ImagePickerComponent {
  protected readonly farImage = faImage;
  protected readonly fasTrash = faTrash;
  protected readonly editMode = inject(EditModeService);
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
          const maxSize = 600;
          let { width, height } = img;
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            } else {
              width = Math.round((width * maxSize) / height);
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
