export interface NpkillResult {
  path: string;
  size: number;
  modificationTime: number;
  isDangerous: boolean;
  status: string;
}
