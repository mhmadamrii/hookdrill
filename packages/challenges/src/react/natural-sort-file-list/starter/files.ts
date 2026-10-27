export type Entry = {
  name: string;
  kind: "file" | "folder";
  /** Size in bytes. Always 0 for folders. */
  sizeBytes: number;
};

export const FILES: Entry[] = [
  { name: "resume.txt", kind: "file", sizeBytes: 2048 },
  { name: "chapter 10", kind: "folder", sizeBytes: 0 },
  { name: "file10.txt", kind: "file", sizeBytes: 64 },
  { name: "img7.png", kind: "file", sizeBytes: 9000 },
  { name: "Photos", kind: "folder", sizeBytes: 0 },
  { name: "README.md", kind: "file", sizeBytes: 4096 },
  { name: "file2.txt", kind: "file", sizeBytes: 512 },
  { name: "img007.png", kind: "file", sizeBytes: 30000 },
  { name: ".env", kind: "file", sizeBytes: 120 },
  { name: "Chapter 9", kind: "folder", sizeBytes: 0 },
  { name: "résumé.pdf", kind: "file", sizeBytes: 81920 },
  { name: "file1.txt", kind: "file", sizeBytes: 2048 },
  { name: "archive", kind: "folder", sizeBytes: 0 },
  { name: "img10.png", kind: "file", sizeBytes: 120000 },
];
