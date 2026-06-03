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
import { InviteLabel, LIB_CONFIG } from 'invite-ui';
import { InviteModel } from 'models-core';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { InviteService } from 'service-core';
import { environment } from 'shared-config';

@Component({
  selector: 'app-edit-form',
  standalone: true,
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
  providers: [
    {
      provide: LIB_CONFIG,
      useValue: environment,
    },
  ],
})
export class EditForm {
  @ViewChild('fileInput') fileInput!: ElementRef;
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  descriptionInputText = model<string>('');
  minDate: string = '';
  btnFinalyText = signal('Criar');
  
  // Inputs vindos do roteador
  id = input.required<string>(); // Pode ser o inviteId ou o themeId
  mode = input.required<'new' | 'edit' | 'page'>();

  croppedBlob: Blob | null = null;
  croppedPreview: string | null = null;
  profileFile: File | null = null;
  imageChangedEvent: any = '';
  isEditingPhoto = false;

  // Signal que guarda o objeto completo (incluindo o tema interno)
  inviteShared = signal<any | null>(null);

  inviteForm = this.fb.nonNullable.group({
    id: '',
    userId: '',
    name: ['', [Validators.required, Validators.minLength(4)]],
    slug: '',
    age: [0, [Validators.required, Validators.min(1)]],
    eventDate: ['', [Validators.required]],
    address: ['', [Validators.required]],
    mapUrl: '',
    description: [[] as string[]],
    showAge: true,
    enableTimer: true,
    confirmEnable: true,
    profileUrl: new FormControl<string | undefined>(undefined),
    darkMode: true,
    themeId: new FormControl<string | ''>('', Validators.required),
    theme: null,
    status: new FormControl('WAP'),
    createdAt: new FormControl(''),
  });

  // Transforma as mudanças do formulário reativo em um Signal legível
  private formValueSignal = toSignal(this.inviteForm.valueChanges, {
    value: this.inviteForm.getRawValue()
  });

  constructor() {
    const agora = new Date();
    this.minDate = agora.toISOString().slice(0, 16);

    // MUDANÇA DE TEXTO DO BOTÃO BASEADO NO MODO
    effect(() => {
      this.btnFinalyText.set(this.mode() === 'edit' ? 'Salvar Alterações' : 'Criar');
    });

    // FLUXO 1: Sempre que o usuário digitar no formulário, atualiza o preview (Pai -> Filho)
    effect(() => {
      const formValues = this.formValueSignal();
      const estadoAtual = this.inviteShared();

      // Mantém o objeto do tema vivo dentro do signal enquanto atualiza os textos
      this.inviteShared.set({
        ...formValues,
        theme: estadoAtual?.theme // Preserva o tema buscado pela API do filho
      });
    });

    // FLUXO 2: Quando o filho carregar os dados da API (ex: no modo 'new' ou 'edit'),
    // nós atualizamos os campos do formulário reativo do Pai (Filho -> Pai)
    effect(() => {
      const dadosDoFilho = this.inviteShared();
      if (dadosDoFilho && dadosDoFilho.theme && !this.inviteForm.get('themeId')?.value) {
        // Desativa temporariamente a emissão de eventos para evitar loops infinitos
        this.inviteForm.patchValue({
          id: dadosDoFilho.id,
          name: dadosDoFilho.name,
          age: dadosDoFilho.age,
          address: dadosDoFilho.address,
          eventDate: dadosDoFilho.eventDate ? dadosDoFilho.eventDate.slice(0, 16) : '',
          description: dadosDoFilho.description,
          showAge: dadosDoFilho.showAge,
          enableTimer: dadosDoFilho.enableTimer,
          confirmEnable: dadosDoFilho.confirmEnable,
          darkMode: dadosDoFilho.darkMode,
          profileUrl: dadosDoFilho.profileUrl,
          themeId: dadosDoFilho.themeId || dadosDoFilho.theme?.id
        }, { emitEvent: false });
      }
    });
  }

  saveInvite() {
    const rawValue = this.inviteForm.getRawValue();
    const data = {
      ...rawValue,
      theme: rawValue.theme ?? undefined,
    } as InviteModel;

    this.saveInviteDraft(data);
    this.router.navigate(['login']);
  }

  private saveInviteDraft(data: InviteModel) {
    const draft = {
      ...data,
      profileUrl: data.profileUrl ?? null,
      profileFileName: this.profileFile?.name ?? null,
    };
    sessionStorage.setItem('inviteDraft', JSON.stringify(draft));
  }

  addToListDescriptions(inputElement: HTMLInputElement) {
    const valor = inputElement.value;
    const control = this.inviteForm.get('description');

    if (control && valor.trim() !== '') {
      const listaAtual = control.value || [];
      control.setValue([...listaAtual, valor.trim()]);
      inputElement.value = '';
      inputElement.focus();
    }
  }

  removeFromListDescriptions(index: number) {
    const control = this.inviteForm.get('description');
    if (control) {
      const currentList = control.value || [];
      const newList = currentList.filter((_: string, i: number) => i !== index);
      control.setValue(newList);
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedBlob = event.blob ?? null;
    this.croppedPreview = event.objectUrl ?? null;
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
    this.isEditingPhoto = true;
  }

  savePhoto() {
    if (!this.croppedBlob || !this.croppedPreview) return;

    const file = new File([this.croppedBlob], 'profile.jpg', {
      type: this.croppedBlob.type || 'image/jpeg',
    });
    this.profileFile = file;

    this.inviteForm.patchValue({
      profileUrl: this.croppedPreview,
    });

    this.isEditingPhoto = false;
    this.imageChangedEvent = null;

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  removePhoto(event: Event) {
    event.stopPropagation();
    this.profileFile = null;
    this.inviteForm.patchValue({
      profileUrl: null,
    });
    this.croppedPreview = null;
    this.imageChangedEvent = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  cancelEditing() {
    this.croppedPreview = null;
    this.isEditingPhoto = false;
    this.imageChangedEvent = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

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
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}