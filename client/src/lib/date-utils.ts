import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

export function formatDateWithTimezone(date: string | Date, formatStr: string, timezone: string = 'UTC'): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (timezone === 'UTC') {
      return format(dateObj, formatStr);
    }
    
    // For other timezones, we'll use the browser's locale with timezone awareness
    return formatInTimeZone(dateObj, timezone, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return format(new Date(date), formatStr);
  }
}

export function toLocaleDateStringWithTimezone(date: string | Date, timezone: string = 'UTC'): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (timezone === 'UTC') {
      return dateObj.toLocaleDateString();
    }
    
    return dateObj.toLocaleDateString('en-US', { 
      timeZone: timezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return new Date(date).toLocaleDateString();
  }
}

export function toDateStringWithTimezone(date: string | Date, timezone: string = 'UTC'): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (timezone === 'UTC') {
      return dateObj.toDateString();
    }
    
    return new Date(dateObj.toLocaleString('en-US', { timeZone: timezone })).toDateString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return new Date(date).toDateString();
  }
}