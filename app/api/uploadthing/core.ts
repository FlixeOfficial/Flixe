// import { auth } from "@clerk/nextjs";
import { createUploadthing, type FileRouter } from 'uploadthing/next';

// import { isTeacher } from "@/lib/teacher";

const f = createUploadthing();

// const handleAuth = () => {
//   const { userId } = auth();
//   const isAuthorized = isTeacher(userId);

//   if (!userId || !isAuthorized) throw new Error("Unauthorized");
//   return { userId };
// }

const fileTypes = [
  'text',
  'image',
  'video',
  'audio',
  'pdf',
  'model/gltf-binary',
  'model/gltf+json',
];

const fileTypeObjects = fileTypes.reduce(
  (acc: { [key: string]: any }, fileType) => {
    acc[fileType] = { maxFileSize: '32MB' };
    return acc;
  },
  {}
);

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: '32MB' } })
    // .middleware(() => handleAuth())
    .onUploadComplete(async ({ metadata, file }) => {}),

  glbModelUploader: f({ blob: { maxFileSize: '32MB' } }).onUploadComplete(
    () => {}
  ),

  flixImage: f({ image: { maxFileSize: '32MB', maxFileCount: 1 } })
    // .middleware(() => handleAuth())
    .onUploadComplete(() => {}),

  flixAttachment: f(['text', 'image', 'video', 'audio', 'pdf'])
    // .middleware(() => handleAuth())
    .onUploadComplete(() => {}),

  episodeVideo: f({ video: { maxFileCount: 1, maxFileSize: '512GB' } })
    // .middleware(() => handleAuth())
    .onUploadComplete(() => {}),

  adVideo: f({ video: { maxFileCount: 1, maxFileSize: '32MB' } })
    // .middleware(() => handleAuth())
    .onUploadComplete(() => {}),

  artFlixe: f(fileTypeObjects)
    // .middleware(() => handleAuth())
    .onUploadComplete(() => {}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
