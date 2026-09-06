/** The implementation physically deletes one named runtime export specifier. */
export function deleteRootExport(source: string, component: string): {
  source: string;
  removed: string;
  replacementCount: number;
};
