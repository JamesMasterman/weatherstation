import { Routes } from '@angular/router';

import { ThisWeekComponent } from '../thisweek/thisweek.component';
import { CurrentWeatherComponent} from '../current-weather/current-weather.component';

export const AdminLayoutRoutes: Routes = [
    {
        path: 'current',  
        component: CurrentWeatherComponent 
    },
    { 
        path: 'thisweek',      
        component: ThisWeekComponent
    }
   
];
