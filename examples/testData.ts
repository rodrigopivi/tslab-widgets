
// Scatter Chart
interface DataConfig {
  count: number;
  heightRange: [number, number];
  weightRange: [number, number];
  ageRange: [number, number];
  heightWeightCorrelation?: number; // 0 to 1
}

export function getScatterData(
  maleConfig: Partial<DataConfig> = {},
  femaleConfig: Partial<DataConfig> = {}
) {
  const defaultConfig: DataConfig = {
    count: 150,
    heightRange: [120, 210],
    weightRange: [50, 130],
    ageRange: [13, 120],
    heightWeightCorrelation: 0.1
  };
  const maleFullConfig: DataConfig = { ...defaultConfig, ...maleConfig };
  const femaleFullConfig: DataConfig = { 
    ...defaultConfig, 
    heightRange: [100, 200],
    weightRange: [30, 100],
    ...femaleConfig 
  };

  const generateDataset = (config: DataConfig, genderOffset: number = 0) => {
    const dataset: Record<string, string | number>[] = [];
    const { count, heightRange, weightRange, ageRange, heightWeightCorrelation = 0.4 } = config;
    const [minHeight, maxHeight] = heightRange;
    const [minWeight, maxWeight] = weightRange;
    const [minAge, maxAge] = ageRange;
    const baseHeightRange = maxHeight - minHeight;
    const baseWeightRange = maxWeight - minWeight;
    
    for (let i = 0; i < count; i++) {
      const randomFactor = Math.random();
      const height = minHeight + (randomFactor * baseHeightRange);
      const correlationStrength = heightWeightCorrelation;
      const correlatedWeight = minWeight + 
        ((height - minHeight) / baseHeightRange) * baseWeightRange * correlationStrength +
        (Math.random() - 0.5) * baseWeightRange * (1 - correlationStrength);

      const weight = Math.max(minWeight, Math.min(maxWeight, correlatedWeight));
      const age = Math.floor(minAge + Math.random() * (maxAge - minAge + 1));      
      const finalHeight = height + genderOffset;
      const finalWeight = weight + (genderOffset * 0.1);

      dataset.push({
        height: parseFloat(finalHeight.toFixed(1)),
        weight: parseFloat(finalWeight.toFixed(1)),
        age
      });
    }
    return dataset;
  };
  const maleHeightWeight = generateDataset(maleFullConfig, 5);
  const femaleHeightWeight = generateDataset(femaleFullConfig, -5);
  return { maleHeightWeight, femaleHeightWeight };
}