"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Sprout, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Profile } from "@/lib/types";

interface Props {
  breeder: Profile;
  action: (formData: FormData) => void | Promise<void>;
}

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("files", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) throw new Error("Не удалось загрузить файл");
  const data = (await res.json()) as { urls: string[] };
  return data.urls[0];
}

export function ProfileForm({ breeder, action }: Props) {
  const [avatar, setAvatar] = useState<string | null>(breeder.avatar_url);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      const url = await uploadFile(fileList[0]);
      setAvatar(url);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={action} className="grid gap-4">
      {/* Аватар + загрузка фотографии */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative size-20 overflow-hidden rounded-full border bg-muted">
          {avatar ? (
            <Image src={avatar} alt={breeder.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Sprout className="size-8" />
            </div>
          )}
        </div>
        <input type="hidden" name="avatar_url" value={avatar ?? ""} />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handleFile(e.target.files)}
        />
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UploadCloud className="size-4" />
            )}
            {avatar ? "Заменить фото" : "Загрузить фото"}
          </Button>
          {avatar && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setAvatar(null)}
            >
              <X className="size-4" /> Убрать
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="name">Имя</Label>
        <Input id="name" name="name" defaultValue={breeder.name} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="city">Город</Label>
        <Input id="city" name="city" defaultValue={breeder.city ?? ""} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="bio">О себе</Label>
        <Textarea id="bio" name="bio" rows={4} defaultValue={breeder.bio ?? ""} />
      </div>
      <Button type="submit" disabled={uploading}>
        Сохранить профиль
      </Button>
    </form>
  );
}
