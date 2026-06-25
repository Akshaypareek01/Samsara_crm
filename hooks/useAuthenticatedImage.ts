"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

/**
 * Renders an image whose URL may require an Authorization header to fetch
 * (e.g. PAN/GST documents served from a protected storage path) by retrying
 * a failed `<img>` load as an authenticated XHR and swapping in a blob URL.
 *
 * Plain `<img src>` requests never send the bearer token, so if the backend
 * gates these documents behind auth, the tag fails silently and the preview
 * box just shows its empty background. This hook detects that failure and
 * re-fetches the same URL with the token attached.
 *
 * @param url - The document URL to display, or empty/null when none is set.
 * @returns The src to render, whether it has permanently failed, and the
 *   onError handler to attach to the `<img>` tag.
 */
export function useAuthenticatedImage(url: string | null | undefined) {
  const [src, setSrc] = useState<string>(url || "");
  const [failed, setFailed] = useState(false);
  const triedAuthFetch = useRef(false);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    triedAuthFetch.current = false;
    setFailed(false);
    setSrc(url || "");
  }, [url]);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const handleError = useCallback(async () => {
    if (!url || triedAuthFetch.current) {
      setFailed(true);
      return;
    }
    triedAuthFetch.current = true;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(url, {
        responseType: "blob",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const blobUrl = URL.createObjectURL(response.data);
      blobUrlRef.current = blobUrl;
      setSrc(blobUrl);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [url]);

  return { src, failed, handleError };
}
