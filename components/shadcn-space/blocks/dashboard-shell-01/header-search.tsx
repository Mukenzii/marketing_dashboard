"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { uz } from "@/lib/i18n/uz";

/** Header book search — submits to /kitoblar?q=… (books list filters on q). */
export default function HeaderSearch() {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(
      q
        ? `/dashboard-shell-01/kitoblar?q=${encodeURIComponent(q)}`
        : "/dashboard-shell-01/kitoblar",
    );
  }

  return (
    <form onSubmit={submit}>
      <InputGroup className="h-9 rounded-md">
        <InputGroupInput
          placeholder={uz.header.search}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <InputGroupAddon>
          <button type="submit" className="cursor-pointer" aria-label={uz.header.search}>
            <SearchIcon />
          </button>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
