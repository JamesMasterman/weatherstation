import { Component, OnInit } from '@angular/core';

declare const $: any;
declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}
export const ROUTES: RouteInfo[] = [
    { path: '/current', title: 'Weather Now',  icon: 'home', class: '' },
    { path: '/thisweek', title: 'This Week',  icon: 'dashboard', class: '' },
    { path: '/heatmap', title: 'Heat Map',  icon:'bubble_chart', class: '' },
    { path: '/customrange', title: 'Custom Dates',  icon:'dashboard', class: '' },
    { path: '/records', title: 'Records',  icon:'library_books', class: '' },
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menuItems: any[];

  constructor() { }

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
  }
  isMobileMenu() {
      if ($(window).width() > 991) {
          return false;
      }
      return true;
  };
}
