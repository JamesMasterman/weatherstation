export const MS_TO_KMPH = 3.6;
export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function getOrdinalNum(n:number) {
    return n + (n > 0 ? ['th', 'st', 'nd', 'rd'][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10] : '');
}

export const TEMP_COLOUR_RANGE = ['#ffffff','#44CEF8', '#9EFDED','#21D010','#6BFE71','#CCFFD0','#FFFDD0','#FFFD3F','#FFCB63','#FBCDCE','#FD9BA2','#D23B48','#C70910'];
export const MOISTURE_COLOUR_RANGE = ['#ffffff','#C70910','#D23B48','#FD9BA2','#FBCDCE','#FFCB63','#FFFD3F','#FFFDD0','#CCFFD0','#6BFE71','#21D010', '#9EFDED','#44CEF8'];