"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { uploadAvatarAction, removeAvatarAction } from "@/lib/actions/profile";
import { uz } from "@/lib/i18n/uz";

const initials = (t: string) =>
  t.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

/** Resize/compress an image entirely in the browser before upload (async). */
async function resizeToJpeg(file: File, max = 320): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob"))),
      "image/jpeg",
      0.85,
    ),
  );
}

export default function AvatarUpload({
  name,
  image,
}: {
  name: string;
  image: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(image);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;
    setError(null);
    try {
      const blob = await resizeToJpeg(file);
      setPreview(URL.createObjectURL(blob));
      const fd = new FormData();
      fd.append("avatar", new File([blob], "avatar.jpg", { type: "image/jpeg" }));
      start(async () => {
        const res = await uploadAvatarAction(fd);
        if (!res.ok) {
          setError(res.error ?? uz.profile.photoError);
          setPreview(image);
        } else {
          router.refresh();
        }
      });
    } catch {
      setError(uz.profile.photoError);
      setPreview(image);
    }
  }

  function onRemove() {
    start(async () => {
      const res = await removeAvatarAction();
      if (res.ok) {
        setPreview(null);
        router.refresh();
      } else {
        setError(res.error ?? uz.profile.photoError);
      }
    });
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-16">
        {preview ? (
          <AvatarImage src={preview} alt={name} />
        ) : null}
        <AvatarFallback className="bg-blue-500/15 text-blue-600 text-lg font-semibold">
          {initials(name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={onFile}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="size-4" />
            {pending ? uz.profile.uploadingPhoto : uz.profile.changePhoto}
          </Button>
          {preview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-2 text-rose-500"
              disabled={pending}
              onClick={onRemove}
            >
              <Trash2 className="size-4" />
              {uz.profile.removePhoto}
            </Button>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {error ? (
            <span className="text-rose-500">{error}</span>
          ) : (
            uz.profile.photoHint
          )}
        </span>
      </div>
    </div>
  );
}
