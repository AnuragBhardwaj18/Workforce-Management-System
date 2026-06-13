using System;

namespace WMS.Domain.Common
{
    public static class DateTimeHelper
    {
        public static DateTime GetIndianTime()
        {
            try
            {
                var indianZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
                return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, indianZone);
            }
            catch
            {
                try
                {
                    var indianZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Kolkata");
                    return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, indianZone);
                }
                catch
                {
                    // Fallback to UTC + 5:30
                    return DateTime.UtcNow.AddHours(5.5);
                }
            }
        }

        public static DateTime Now => GetIndianTime();
    }
}
