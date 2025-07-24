export interface ServerState {
  isScanning: boolean;
  settings: {
    rootPath: string;
    targetDirs: string[];
    excludePattern: string[];
    excludeHidden: boolean;
  };
  information: {
    userHomePath: string;
    npkillWebVersion: string;
  };
  storage: {
    initialDiskSize: number;
  };
  stats: {
    releasableSpace: number;
    releasedSpace: number;
    totalResults: number;
    deletedResults: number;
  };
}
