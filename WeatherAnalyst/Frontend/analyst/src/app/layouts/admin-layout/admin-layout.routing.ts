import { Routes } from '@angular/router';

import { ThisWeekComponent } from '../thisweek/thisweek.component';
import { CurrentWeatherComponent} from '../current-weather/current-weather.component';
import { HeatmapComponent } from '../heatmap/heatmap.component';

export const AdminLayoutRoutes: Routes = [
    {
        path: 'current',  
        component: CurrentWeatherComponent 
    },
    { 
        path: 'thisweek',      
        component: ThisWeekComponent
    },
    {
        path: 'heatmap',
        component: HeatmapComponent
    }
];
