// CHIRPS Rainfall Deviation from 30-Year Mean Analysis
// Google Earth Engine Implementation

// ============================================================================
// CONFIGURATION AND STUDY AREA
// ============================================================================

// Define study area (example: India - change as needed)
var studyArea = ee.Geometry.Rectangle([68, 6, 97, 37]); // [minLon, minLat, maxLon, maxLat]
// Alternative: Use a country boundary
// var studyArea = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017')
//                   .filter(ee.Filter.eq('country_na', 'India'));

// Set map center
Map.setCenter(80.0, 22.0, 5);

// Define time periods
var baselineStart = '1991-01-01';
var baselineEnd = '2020-12-31';
var currentYear = '2023-01-01';
var currentYearEnd = '2023-12-31';

// ============================================================================
// LOAD CHIRPS DATASET
// ============================================================================

// Load CHIRPS pentad (5-day) precipitation data
var chirpsCollection = ee.ImageCollection('UCSB-CHG/CHIRPS/PENTAD')
                         .filterBounds(studyArea);

print('Total CHIRPS images available:', chirpsCollection.size());

// ============================================================================
// CALCULATE 30-YEAR CLIMATOLOGICAL MEAN (1991-2020)
// ============================================================================

// Filter for baseline period (30 years)
var baselineCollection = chirpsCollection
                          .filterDate(baselineStart, baselineEnd);

print('Baseline period images (1991-2020):', baselineCollection.size());

// Calculate annual precipitation for each year in baseline period
var years = ee.List.sequence(1991, 2020);

var annualPrecipBaseline = years.map(function(year) {
  var yearStart = ee.Date.fromYMD(year, 1, 1);
  var yearEnd = ee.Date.fromYMD(year, 12, 31);
  
  var yearlySum = baselineCollection
                    .filterDate(yearStart, yearEnd)
                    .select('precipitation')
                    .sum()
                    .set('year', year);
  
  return yearlySum;
});

// Convert to ImageCollection and calculate 30-year mean
var annualCollection = ee.ImageCollection.fromImages(annualPrecipBaseline);
var thirtyYearMean = annualCollection.mean().rename('rainfall_30yr_mean');

print('30-year mean calculated');

// ============================================================================
// CALCULATE CURRENT YEAR PRECIPITATION
// ============================================================================

var currentYearPrecip = chirpsCollection
                         .filterDate(currentYear, currentYearEnd)
                         .select('precipitation')
                         .sum()
                         .rename('rainfall_current');

print('Current year precipitation calculated');

// ============================================================================
// CALCULATE RAINFALL DEVIATION
// ============================================================================

// Absolute deviation (mm)
var absoluteDeviation = currentYearPrecip.subtract(thirtyYearMean)
                                        .rename('absolute_deviation');

// Percentage deviation (%)
var percentageDeviation = currentYearPrecip.subtract(thirtyYearMean)
                                          .divide(thirtyYearMean)
                                          .multiply(100)
                                          .rename('percentage_deviation');

// Standardized deviation (z-score)
var standardDeviation = annualCollection.reduce(ee.Reducer.stdDev());
var zScore = currentYearPrecip.subtract(thirtyYearMean)
                             .divide(standardDeviation)
                             .rename('z_score');

// ============================================================================
// CALCULATE REGIONAL STATISTICS
// ============================================================================

// Calculate mean statistics over study area
var meanStats = ee.Image.cat([
  thirtyYearMean,
  currentYearPrecip,
  absoluteDeviation,
  percentageDeviation,
  zScore
]).reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: studyArea,
  scale: 5566, // CHIRPS native resolution
  maxPixels: 1e9
});

print('Regional Statistics:', meanStats);

// ============================================================================
// VISUALIZATION
// ============================================================================

// Visualization parameters
var precipVis = {
  min: 0,
  max: 2000,
  palette: ['white', 'blue', 'darkblue', 'purple']
};

var deviationVis = {
  min: -500,
  max: 500,
  palette: ['red', 'orange', 'white', 'lightblue', 'blue']
};

var percentVis = {
  min: -50,
  max: 50,
  palette: ['red', 'orange', 'white', 'lightgreen', 'darkgreen']
};

var zScoreVis = {
  min: -3,
  max: 3,
  palette: ['darkred', 'red', 'orange', 'white', 'lightblue', 'blue', 'darkblue']
};

// Add layers to map
Map.addLayer(thirtyYearMean.clip(studyArea), precipVis, '30-Year Mean Rainfall (mm)', false);
Map.addLayer(currentYearPrecip.clip(studyArea), precipVis, '2023 Rainfall (mm)', false);
Map.addLayer(absoluteDeviation.clip(studyArea), deviationVis, 'Absolute Deviation (mm)');
Map.addLayer(percentageDeviation.clip(studyArea), percentVis, 'Percentage Deviation (%)', false);
Map.addLayer(zScore.clip(studyArea), zScoreVis, 'Standardized Deviation (Z-score)', false);

// ============================================================================
// CREATE CHARTS
// ============================================================================

// Time series chart of annual precipitation
var timeSeriesChart = ui.Chart.image.series({
  imageCollection: annualCollection.select('precipitation'),
  region: studyArea,
  reducer: ee.Reducer.mean(),
  scale: 5566
}).setOptions({
  title: 'Annual Precipitation Time Series (1991-2020)',
  hAxis: {title: 'Year'},
  vAxis: {title: 'Precipitation (mm)'},
  lineWidth: 2
});

print('Annual Precipitation Time Series:', timeSeriesChart);

// Histogram of deviation values
var histogram = ui.Chart.image.histogram({
  image: percentageDeviation.clip(studyArea),
  region: studyArea,
  scale: 5566,
  maxBuckets: 50
}).setOptions({
  title: 'Distribution of Rainfall Deviation (%)',
  hAxis: {title: 'Deviation (%)'},
  vAxis: {title: 'Frequency'}
});

print('Deviation Histogram:', histogram);

// ============================================================================
// EXPORT RESULTS
// ============================================================================

// Export deviation map
Export.image.toDrive({
  image: percentageDeviation.clip(studyArea),
  description: 'CHIRPS_Rainfall_Deviation_2023',
  folder: 'GEE_Exports',
  scale: 5566,
  region: studyArea,
  maxPixels: 1e9
});

// Export statistics as a table
var statsFeature = ee.Feature(null, meanStats);
var statsCollection = ee.FeatureCollection([statsFeature]);

Export.table.toDrive({
  collection: statsCollection,
  description: 'CHIRPS_Rainfall_Statistics_2023',
  folder: 'GEE_Exports',
  fileFormat: 'CSV'
});

// ============================================================================
// DROUGHT/WET CONDITIONS CLASSIFICATION
// ============================================================================

// Classify based on percentage deviation
var conditions = percentageDeviation
  .where(percentageDeviation.lt(-30), 1)  // Severe drought
  .where(percentageDeviation.gte(-30).and(percentageDeviation.lt(-20)), 2)  // Moderate drought
  .where(percentageDeviation.gte(-20).and(percentageDeviation.lt(-10)), 3)  // Mild drought
  .where(percentageDeviation.gte(-10).and(percentageDeviation.lte(10)), 4)   // Normal
  .where(percentageDeviation.gt(10).and(percentageDeviation.lte(20)), 5)     // Mild wet
  .where(percentageDeviation.gt(20).and(percentageDeviation.lte(30)), 6)     // Moderate wet
  .where(percentageDeviation.gt(30), 7)   // Severe wet
  .rename('rainfall_conditions');

// Visualization for conditions
var conditionsVis = {
  min: 1,
  max: 7,
  palette: ['darkred', 'red', 'orange', 'yellow', 'lightgreen', 'green', 'darkgreen']
};

Map.addLayer(conditions.clip(studyArea), conditionsVis, 'Rainfall Conditions', false);

// ============================================================================
// SUMMARY STATISTICS
// ============================================================================

// Calculate area statistics for each condition
var areaImage = ee.Image.pixelArea().divide(1000000); // Convert to km²

var conditionAreas = conditions.addBands(areaImage).reduceRegion({
  reducer: ee.Reducer.sum().group({
    groupField: 0,
    groupName: 'condition'
  }),
  geometry: studyArea,
  scale: 5566,
  maxPixels: 1e9
});

print('Area by Rainfall Condition (km²):', conditionAreas);

// Print summary
print('='.repeat(60));
print('CHIRPS RAINFALL DEVIATION ANALYSIS SUMMARY');
print('='.repeat(60));
print('Study Period: 1991-2020 (Baseline) vs 2023 (Current)');
print('Dataset: CHIRPS Pentad Precipitation');
print('Resolution: ~5.5 km');
print('Baseline Years: 30 years (1991-2020)');
print('='.repeat(60));
