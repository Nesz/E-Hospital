using System;

namespace Core.Helpers;

public static class DateTimeExtension
{
    public static DateTime SetTime(this DateTime date, TimeSpan time)
    {
        return new DateTime(
            date.Year,
            date.Month,
            date.Day,
            time.Hours,
            time.Minutes,
            time.Seconds
        );
    }
}