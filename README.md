# Rainfall-Deviation-from-the-30-year-mean-using-CHIRPS-Gridded-Rainfall-Data
# CHIRPS Rainfall Deviation Analysis

A comprehensive Google Earth Engine (GEE) implementation for analyzing rainfall deviations from 30-year climatological means using CHIRPS (Climate Hazards Group InfraRed Precipitation with Station data) gridded rainfall dataset.

## Overview

This project calculates rainfall anomalies by comparing current year precipitation against a 30-year baseline (1991-2020) to identify drought and wet conditions. The analysis provides multiple deviation metrics and automated classification of rainfall conditions for climate monitoring and agricultural applications.

## Dataset Information

**CHIRPS Precipitation Data**
- **Source**: University of California, Santa Barbara (UCSB) Climate Hazards Group
- **Temporal Resolution**: Pentad (5-day intervals)
- **Spatial Resolution**: 0.05° (~5.5 km at equator)
- **Coverage**: Global, 50°S to 50°N
- **Temporal Range**: 1981 to near real-time
- **GEE Asset**: `UCSB-CHG/CHIRPS/PENTAD`

## Key Features

### Climate Analysis
- **30-year baseline climatology** (1991-2020 WMO standard)
- **Multi-metric deviation calculation** (absolute, percentage, standardized)
- **Automated drought/wet classification** (7-category system)
- **Statistical significance assessment** using z-scores
- **Area-based condition statistics**

### Visualization & Analysis
- **Interactive map layers** with scientifically appropriate color schemes
- **Time series analysis** of annual precipitation trends
- **Histogram distribution** of deviation values
- **Regional statistics** and summary reports
- **Export-ready datasets** for further analysis

## Methodology

### 1. Baseline Climatology Calculation
```
30-Year Mean = Σ(Annual Precipitation 1991-2020) / 30 years
```

### 2. Deviation Metrics
- **Absolute Deviation**: `Current - Baseline (mm)`
- **Percentage Deviation**: `((Current - Baseline) / Baseline) × 100 (%)`
- **Standardized Deviation**: `(Current - Baseline) / Standard Deviation (z-score)`

### 3. Rainfall Condition Classification
| Category | Percentage Deviation | Classification |
|----------|---------------------|----------------|
| 1 | < -30% | Severe Drought |
| 2 | -30% to -20% | Moderate Drought |
| 3 | -20% to -10% | Mild Drought |
| 4 | -10% to +10% | Normal |
| 5 | +10% to +20% | Mild Wet |
| 6 | +20% to +30% | Moderate Wet |
| 7 | > +30% | Severe Wet |

## Implementation

### Prerequisites
- Google Earth Engine account with access permissions
- Basic knowledge of JavaScript and GEE API
- Understanding of climatological concepts

### Setup Instructions

1. **Open Google Earth Engine Code Editor**
   - Navigate to [https://code.earthengine.google.com](https://code.earthengine.google.com)
   - Ensure your GEE account has access to CHIRPS dataset

2. **Configure Study Area**
   ```javascript
   // Option 1: Bounding box
   var studyArea = ee.Geometry.Rectangle([minLon, minLat, maxLon, maxLat]);
   
   // Option 2: Country/region boundary
   var studyArea = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017')
                     .filter(ee.Filter.eq('country_na', 'YourCountry'));
   ```

3. **Set Time Periods**
   ```javascript
   var baselineStart = '1991-01-01';
   var baselineEnd = '2020-12-31';
   var currentYear = '2023-01-01';
   var currentYearEnd = '2023-12-31';
   ```

4. **Run Analysis**
   - Execute the complete script in GEE
   - Monitor console for progress and statistics
   - Review generated maps and charts

### Customization Options

**Study Area Modification**
- Replace coordinates for different regions
- Use administrative boundaries from GEE catalog
- Adjust map center and zoom level

**Time Period Adjustment**
- Modify baseline years (minimum 20 years recommended)
- Change current analysis year
- Implement seasonal analysis (modify date filters)

**Classification Thresholds**
- Adjust percentage deviation thresholds
- Modify color schemes for visualization
- Add custom drought indices

## Outputs

### Map Layers
1. **30-Year Mean Rainfall** - Long-term climatological average
2. **Current Year Rainfall** - Total precipitation for analysis year
3. **Absolute Deviation** - Difference in millimeters
4. **Percentage Deviation** - Relative change from baseline
5. **Standardized Deviation** - Z-score for statistical significance
6. **Rainfall Conditions** - Classified drought/wet categories

### Charts and Statistics
- **Annual precipitation time series** (1991-2020)
- **Deviation histogram** showing distribution
- **Regional mean statistics** for all metrics
- **Area calculations** by rainfall condition
- **Export-ready datasets** (GeoTIFF and CSV formats)

## Applications

### Climate Monitoring
- Drought early warning systems
- Seasonal rainfall assessment
- Climate change impact studies
- Water resource management

### Agricultural Applications
- Crop yield prediction
- Irrigation planning
- Agricultural insurance assessment
- Food security monitoring

### Research Applications
- Climate variability studies
- Extreme event analysis
- Model validation
- Impact assessment studies

## Technical Specifications

**Processing Requirements**
- **Scale**: 5566 meters (CHIRPS native resolution)
- **Maximum Pixels**: 1 billion (adjustable)
- **Memory**: Optimized for large-scale analysis
- **Export Formats**: GeoTIFF (images), CSV (statistics)

**Performance Considerations**
- Large study areas may require longer processing times
- Consider using geometry simplification for complex boundaries
- Implement tiling for continental-scale analysis
- Monitor GEE usage quotas for extensive processing

## Validation and Quality Control

**Data Quality Checks**
- Temporal completeness assessment
- Spatial coverage validation
- Statistical outlier detection
- Comparison with station data (where available)

**Accuracy Considerations**
- CHIRPS uncertainty in data-sparse regions
- Elevation-dependent precipitation effects
- Seasonal bias in satellite estimates
- Station data incorporation limitations

## Limitations

**Dataset Limitations**
- 0.05° spatial resolution may miss local variations
- Satellite-based estimates have inherent uncertainties
- Limited accuracy in mountainous regions
- Potential bias in tropical regions

**Methodology Limitations**
- 30-year baseline may not capture long-term trends
- Linear trend assumptions in some calculations
- Static threshold classifications
- Limited sub-seasonal analysis capability

## Export and Integration

**Export Options**
```javascript
// Export deviation map
Export.image.toDrive({
  image: percentageDeviation,
  description: 'CHIRPS_Rainfall_Deviation_YYYY',
  scale: 5566,
  region: studyArea
});

// Export statistics
Export.table.toDrive({
  collection: statsCollection,
  description: 'Rainfall_Statistics_YYYY',
  fileFormat: 'CSV'
});
```

**Integration Possibilities**
- ArcGIS/QGIS for advanced spatial analysis
- R/Python for statistical modeling
- Web applications using GEE Apps
- Automated reporting systems

## Future Enhancements

**Planned Improvements**
1. **Multi-temporal analysis** - Seasonal and monthly deviations
2. **Trend analysis** - Long-term precipitation trends
3. **Extreme event detection** - Automated anomaly identification
4. **Comparison tools** - Multiple dataset integration
5. **Real-time monitoring** - Automated update workflows

## Contributing

When contributing to this project:
- Test modifications with different geographic regions
- Validate results against known drought/wet events
- Document parameter changes and their impacts
- Share performance optimizations
- Report issues with specific study areas or time periods

## Support and Documentation

**Resources**
- [CHIRPS Dataset Documentation](https://www.chc.ucsb.edu/data/chirps)
- [Google Earth Engine Guides](https://developers.google.com/earth-engine/guides)
- [Climate Data Analysis Best Practices](https://www.wmo.int/pages/prog/wcp/ccl/)

**Common Issues**
- Memory limit exceeded: Reduce study area or use lower resolution
- Export timeout: Implement tiling for large regions
- Data gaps: Check CHIRPS data availability for specific dates
- Slow processing: Optimize geometry complexity and scale

---

*This tool provides a foundation for rainfall deviation analysis and can be adapted for various climate monitoring applications. The methodology follows international standards for climatological analysis and supports both research and operational use cases.*
