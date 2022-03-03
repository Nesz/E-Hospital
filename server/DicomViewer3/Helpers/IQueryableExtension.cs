using System;
using System.Linq;

namespace DicomViewer3.Helpers
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
        
        public static IOrderedQueryable<T> IfThenElse<T>(
            this IQueryable<T> elements,
            Func<bool> condition,
            Func<IQueryable<T>, IOrderedQueryable<T>> thenPath,
            Func<IQueryable<T>, IOrderedQueryable<T>> elsePath)
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