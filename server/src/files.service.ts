import checkDiskSpaceModule from "check-disk-space";
import { platform } from "os";

export class FilesService {
  getTotalDiskSize(): Promise<number> {
    const diskPath = platform() === "win32" ? "C:" : "/";
    const checkDiskSpace =
      (checkDiskSpaceModule as any).default || checkDiskSpaceModule;
    return checkDiskSpace(diskPath).then(
      (diskSpace: { disPath: string; free: number; size: number }) => {
        return diskSpace.size;
      }
    );
  }
}
