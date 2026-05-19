import { notFound } from "next/navigation";
import Link from "next/link";
import { getAlbumById } from "@/lib/db/gallery";
import { ArrowLeft, ImageIcon } from "lucide-react";
import Footer from "@/components/home/Footer";
import PhotoGrid from "@/components/gallery/PhotoGrid";

export default async function AlbumDetailPage({
  params,
}: {
  params: Promise<{ albumId: string }>;
}) {
  const { albumId } = await params;
  const album = await getAlbumById(albumId);

  if (!album || !album.is_published) {
    notFound();
  }

  const serializedImages = JSON.parse(JSON.stringify(album.images));

  return (
    <main className="min-h-screen">
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Gallery
          </Link>

          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              {album.title}
            </h1>
            {album.description && (
              <p className="text-muted-foreground text-lg mb-2">{album.description}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
              <span>
                {album.images.length} {album.images.length === 1 ? "photo" : "photos"}
              </span>
            </div>
          </div>

          {album.images.length === 0 ? (
            <div className="text-center py-20">
              <ImageIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No photos in this album yet</p>
            </div>
          ) : (
            <PhotoGrid images={serializedImages} />
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
