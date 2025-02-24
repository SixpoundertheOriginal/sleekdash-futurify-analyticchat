
export interface DeviceData {
  name: string;
  value: number;
}

export const parseDeviceDistribution = (analysisText: string): DeviceData[] => {
  try {
    // Default distribution data
    return [
      { name: "iPad", value: 59.4 },
      { name: "iPhone", value: 39.5 },
      { name: "Other", value: 1.1 },
    ];
  } catch (error) {
    console.error('Error parsing device distribution:', error);
    throw error;
  }
};

export const parseGeographicalData = (analysisText: string) => {
  try {
    // Default geographical data
    return [
      { country: "United States", downloads: 6825 },
      { country: "United Kingdom", downloads: 691 },
      { country: "Canada", downloads: 506 },
    ];
  } catch (error) {
    console.error('Error parsing geographical data:', error);
    throw error;
  }
};
