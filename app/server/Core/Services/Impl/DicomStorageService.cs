using System;
using System.IO;
using System.Threading.Tasks;
using Core.Entities;

namespace Core.Services.Impl;

public class DicomStorageService
{
    public readonly string Storage = Path.Combine(Environment.CurrentDirectory, "files");
    
    public async Task WriteBytesForInstance(Instance instance, ReadOnlyMemory<byte> bytes)
    {
        Console.WriteLine(Storage);
        if (!Directory.Exists(Storage)) {
            Directory.CreateDirectory(Storage);
        }
        var filePath = instance.Series.FilePath;
        await using var stream = new FileStream(filePath, FileMode.OpenOrCreate);
        stream.Seek(instance.FileOffset, SeekOrigin.Begin);
        await stream.WriteAsync(bytes);
    }
}