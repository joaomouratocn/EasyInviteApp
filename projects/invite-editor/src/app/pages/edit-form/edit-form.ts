import { CommonModule, NgClass } from '@angular/common';
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  model,
  signal,
  ViewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { InviteLabel } from 'invite-ui';
import { InviteModel } from 'models-core';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { InviteService } from 'service-core';

@Component({
  selector: 'app-edit-form',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ImageCropperComponent,
    InviteLabel,
    CommonModule,
    NgClass,
    RouterModule,
  ],
  templateUrl: './edit-form.html',
  styleUrl: './edit-form.css',
})
export class EditForm {
  @ViewChild('fileInput') fileInput!: ElementRef;
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private inviteService = inject(InviteService);
  descriptionInputText = model<string>('');
  imageChangedEvent: any = '';
  isEditingPhoto = false;
  minDate: string = '';
  btnFinalyText = signal('Criar');
  id = input.required<string>();
  mode = input.required<string>();
  croppedBlob: Blob | null = null;
  croppedPreview: string | null = null;
  profileFile: File | null = null;

  inviteForm = this.fb.nonNullable.group({
    id: '',
    slug: '',
    name: ['', [Validators.required, Validators.minLength(4)]],
    age: [0, [Validators.required, Validators.min(1)]],
    eventDate: ['', [Validators.required]],
    address: ['', [Validators.required]],
    mapUrl: '',
    description: [[] as string[]],
    showAge: true,
    enableTimer: true,
    confirmEnable: true,
    darkMode: true,
    imagePreview: new FormControl<string | undefined>(undefined),
    profileUrl: new FormControl<string | undefined>(undefined),
    themeId: new FormControl<string | ''>('', Validators.required),
    status: new FormControl('EN'),
    createdAt: new FormControl(''),
  });

  formValue = toSignal(this.inviteForm.valueChanges, {
    initialValue: this.inviteForm.getRawValue(),
  });

  invitePreview = computed<InviteModel>(() => {
    const form = this.formValue();
    this.croppedPreview = form.profileUrl ?? null;

    return {
      id: form.id || '',
      slug: form.slug || '',
      name: form.name || '',
      age: form.age || 0,
      eventDate: form.eventDate || new Date().toISOString(),
      address: form.address || 'Endereço',
      mapUrl: form.mapUrl || '',
      description: form.description || [],
      showAge: form.showAge ?? true,
      enableTimer: form.enableTimer ?? true,
      confirmEnable: form.confirmEnable ?? true,
      profileUrl: form.profileUrl || null,
      darkMode: form.darkMode ?? false,
      themeId: form.themeId || '',
      status: form.status || 'ACT',
      createdAt: form.createdAt || '',
    };
  });

  constructor() {
    const agora = new Date();
    this.minDate = agora.toISOString().slice(0, 16);

    effect(() => {
      // O effect monitora automaticamente os inputs 'id' e 'mode'
      const currentId = this.id();
      const currentMode = this.mode();

      if (currentMode === 'edit') {
        // No modo EDIT: busca convite -> depois tema
        this.inviteService.getInvite(currentId).subscribe((invite) => {
          this.inviteForm.patchValue(invite);
          this.btnFinalyText.set('Salvar');
        });
      } else {
        // No modo NEW: busca tema direto
        this.inviteService.getThemeById(currentId).subscribe((theme) => {
          this.inviteForm.patchValue({ themeId: currentId });
          this.btnFinalyText.set('Criar');
        });
      }
    });
  }

  save() {
    const data = this.inviteForm.getRawValue() as InviteModel;
    this.inviteService.saveInvite(data).subscribe({
      next: (result) => {
        if (result) {
          localStorage.setItem('tempId', '123');
          this.router.navigate(['login']);
        }
      },
      error: (err) => {
        this.showMessage('Erro ao cadastrar convite, tente novamente mais tarde', 'fechar');
      },
    });
  }

  addToListDescriptions(inputElement: HTMLInputElement) {
    const valor = inputElement.value;
    const control = this.inviteForm.get('description');

    if (control && valor.trim() !== '') {
      const listaAtual = control.value || [];

      // Atualiza o FormControl com o novo array
      control.setValue([...listaAtual, valor.trim()]);

      // Limpa o texto da caixa de entrada diretamente no DOM
      inputElement.value = '';

      // Devolve o foco para o input para continuar digitando
      inputElement.focus();
    }
  }

  removeFromListDescriptions(index: number) {
    const control = this.inviteForm.get('description');

    if (control) {
      const currentList = control.value || [];

      // Remove o item baseado na posição (index)
      const newList = currentList.filter((_: string, i: number) => i !== index);

      // Atualiza o formulário com o novo array
      control.setValue(newList);
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedBlob = event.blob ?? null;
    this.croppedPreview = event.objectUrl ?? event.base64 ?? null;
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
    this.isEditingPhoto = true; // Abre o cropper assim que seleciona
  }

  savePhoto() {
    if (!this.croppedBlob) return;

    const file = new File([this.croppedBlob], 'profile.jpg', {
      type: this.croppedBlob.type || 'image/jpeg',
    });

    const tempUrl = URL.createObjectURL(file);

    this.profileFile = file;

    this.inviteForm.patchValue({
      profileUrl: tempUrl,
    });

    this.isEditingPhoto = false;
    this.imageChangedEvent = null;

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  removePhoto(event: Event) {
    // Impede que o clique no botão de remover dispare o clique do círculo (input file)
    event.stopPropagation();

    // 1. Limpa o valor no formulário
    this.profileFile = null;

    //2. Remove link temporario
    this.inviteForm.patchValue({
      profileUrl: null,
    });

    // 2. Reseta as pré-visualizações
    this.croppedPreview = null;
    this.imageChangedEvent = null;

    // 3. Limpa o input file físico para permitir selecionar a mesma foto depois
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  cancelEditing() {
    this.croppedPreview = null;
    this.isEditingPhoto = false;
    this.imageChangedEvent = null;

    // O SEGREDO: Limpa o valor do input para permitir selecionar o mesmo arquivo
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // Validador Customizado para garantir que não seja no passado (Lógica)
  futureDateValidator(control: FormControl) {
    const selectedDate = new Date(control.value);
    const now = new Date();
    return selectedDate > now ? null : { pastDate: true };
  }

  base64ToFile(dataUrl: string, filename: string): File {
    if (!dataUrl.includes('base64,')) {
      throw new Error('Imagem inválida: esperado dataURL em base64.');
    }

    const [header, base64] = dataUrl.split(',');
    const mime = header.match(/data:(.*?);base64/)?.[1] ?? 'image/jpeg';

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return new File([bytes], filename, { type: mime });
  }

  logout() {
    this.router.navigate(['/login']);
  }

  showMessage(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000, // Closes after 3 seconds
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  async urlToFile(url: string, fileName: string): Promise<File> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], fileName, { type: blob.type });
  }
}
