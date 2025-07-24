export interface SummaryData {
  releasableSpace: number;
  releasedSpace: number;
  totalResults: number;
  itemsDeleted: number;
  percentageHardDriveFreed: number;
}

export interface SummaryCardOptions {
  visibility: {
    date: boolean;
    releasableSpace: boolean;
    releasedSpace: boolean;
    totalResults: boolean;
    itemsDeleted: boolean;
    percentageHardDriveFreed: boolean;
  };
  footerNote?: string;
}
