export interface DailySummaryModel {
    temp_max: number;
    temp_min: number;
    avg_humidity: number;
    total_rain: number;
    soil_temp: number;
    soil_moist: number;
    wind_max: number;
    wind_avg: number;
    wind_direction: string;
    last_reading: string;
}