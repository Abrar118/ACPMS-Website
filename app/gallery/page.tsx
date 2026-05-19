import { Suspense } from "react";
import { getPublishedAlbums } from "@/lib/db/gallery";
import Footer from "@/components/home/Footer";
import GalleryClient from "@/components/gallery/GalleryClient";

export default async function GalleryPage() {
  const albums = await getPublishedAlbums();

  return (
    <main className="min-h-screen">
      <Suspense
        fallback={
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        }
      >
        <GalleryClient albums={JSON.parse(JSON.stringify(albums))} />
      </Suspense>
      <Footer />
    </main>
  );
}
