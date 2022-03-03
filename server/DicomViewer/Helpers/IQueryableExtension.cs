using System;
using System.Collections.Generic;
using System.Linq;

namespace DicomViewer.Helpers
{
    public static class QueryableExtension
    {
        public static IQueryable<T> IfThenElse<T>(
            this IQueryable<T> elements,
            Func<bool> condition,
            Func<IQueryable<T>, IQueryable<T>> thenPath,
            Func<IQueryable<T>, IQueryable<T>> elsePath)
        {
            return condition()
                ? thenPath(elements)
                : elsePath(elements);
        }
        
        public static IQueryable<T> If<T>(
            this IQueryable<T> elements,
            Func<bool> condition,
            Func<IQueryable<T>, IQueryable<T>> thenPath)
        {
            return condition()
                ? thenPath(elements)
                : elements;
        }
    }
}